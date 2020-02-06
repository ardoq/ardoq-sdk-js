import { map, mapValues, mapKeys } from 'lodash';
import { pivot, group, unique, mapValuesAsync, construct } from './utils';
import {
  Field,
  Model,
  Component,
  Reference,
  AggregatedWorkspace,
  FieldType,
  ApiProperties,
} from '../ardoq/types';
import { getAggregatedWorkspace, getModel, getFields } from '../ardoq/api';
import { calculateDiff } from './diff';
import { consolidateDiff } from './consolidate';
import {
  SimpleField,
  Graph,
  LocalGraph,
  WorkspaceId,
  RemoteModel,
  RemoteGraph,
  RemoteComponent,
  RemoteReference,
  IdMap,
} from './types';
import { collectRefTypes, collectCompTypes } from './collectUtils';

/*
 * Sync a simple graph to Ardoq
 */

const REQUIRED_FIELDS: SimpleField[] = [
  {
    type: FieldType.TEXT,
    name: 'customId',
    label: 'Integration entity id',
    description: 'Used by Integration Util to track entities',
  },
];

const buildLocalGraph = <CF, RF>(graph: Graph<CF, RF>): LocalGraph<CF, RF> => {
  const cbyi = pivot(graph.components, 'customId');
  const components = mapValues(
    group(graph.components, 'workspace'),
    wsComponents => pivot(wsComponents, 'customId')
  );
  const references = mapValues(
    group(
      graph.references.map(reference => ({
        ...reference,
        workspace: cbyi[reference.source].workspace,
      })),
      'workspace'
    ),
    wsReferences => pivot(wsReferences, 'customId')
  );
  const componentTypes = mapValues(components, wsComponents =>
    unique(map(wsComponents, 'type'))
  );
  const referenceTypes = mapValues(references, wsReferences =>
    unique(map(wsReferences, 'type'))
  );

  return { components, references, componentTypes, referenceTypes };
};

const buildRemoteModel = (
  model: Record<WorkspaceId, Model>,
  fields: Field[]
): RemoteModel => {
  const fieldsByModel = group(fields, 'model');
  return {
    referenceTypes: mapValues(model, wsModel =>
      mapKeys(wsModel.referenceTypes, 'name')
    ),
    componentTypes: mapValues(model, wsModel => mapKeys(wsModel.root, 'name')),
    fields: mapValues(model, wsModel =>
      pivot(fieldsByModel[wsModel._id], 'name')
    ),
  };
};

const buildRemoteGraph = <CF, RF>(
  workspaces: Record<WorkspaceId, AggregatedWorkspace>
): RemoteGraph<Partial<CF>, Partial<RF>> => ({
  components: mapValues(workspaces, workspace =>
    pivot(
      workspace.components as (Component & Partial<RemoteComponent<CF>>)[],
      'customId'
    )
  ),
  references: mapValues(workspaces, workspace =>
    pivot(
      workspace.references as (Reference & Partial<RemoteReference<RF>>)[],
      'customId'
    )
  ),
});

const buildIdMap = (
  workspaces: Record<string, WorkspaceId>,
  model: RemoteModel,
  local: LocalGraph,
  remote: RemoteGraph
): IdMap => ({
  refTypes: mapValues(model.referenceTypes, refTypes =>
    collectRefTypes(refTypes)
  ),
  compTypes: mapValues(model.componentTypes, compTypes =>
    collectCompTypes(compTypes)
  ),
  components: construct([
    ...map(local.components, components =>
      map(components, ({ customId }) => [customId, customId] as const)
    ).flat(),
    ...map(remote.components, (components, workspace) =>
      map(components, ({ customId, _id }) => [customId, _id] as const).filter(
        ([customId]) =>
          // Must check this is not a component that changed workspace
          !(
            local.components[workspace] &&
            local.components[workspace][customId] === undefined
          )
      )
    ).flat(),
  ]),
  compWorkspaces: construct(
    map(local.components, components =>
      map(
        components,
        ({ customId, workspace }) => [customId, workspaces[workspace]] as const
      )
    ).flat()
  ),
});

export const sync = async <CF, RF>(
  apiProperties: ApiProperties,
  workspaces: Record<string, WorkspaceId>,
  graph: Graph<CF, RF>,
  fields: SimpleField[] = []
) => {
  const aqWorkspaces = await mapValuesAsync(workspaces, workspace =>
    getAggregatedWorkspace(apiProperties, workspace)
  );

  const aqModels = await mapValuesAsync(aqWorkspaces, workspace =>
    getModel(apiProperties, workspace.componentModel)
  );

  const aqFields = await getFields(apiProperties);

  // Create representations that are simpler to use. Lookup by workspace name and custom/local ids
  const localGraph = buildLocalGraph(graph);
  const remoteModel = buildRemoteModel(aqModels, aqFields);
  const remoteGraph = buildRemoteGraph<CF, RF>(aqWorkspaces);

  const ids = buildIdMap(workspaces, remoteModel, localGraph, remoteGraph);

  const diff = calculateDiff(remoteModel, remoteGraph, localGraph, ids, [
    ...fields,
    ...REQUIRED_FIELDS,
  ]);

  await consolidateDiff(apiProperties, aqModels, diff, ids);
};
