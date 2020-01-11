import { map, mapValues, mapKeys } from 'lodash';
import { pivot, group, unique, mapValuesAsync } from './utils';
import {
  ModelReference,
  ModelComponent,
  Field,
  Model,
  Component,
  Reference,
  AggregatedWorkspace,
  FieldType,
  LispyString,
} from '../ardoq/types';
import { getAggregatedWorkspace, getModel, getFields } from '../ardoq/api';
import { calculateDiff } from './diff';

/*
 * Sync a simple graph to Ardoq
 */

type ComponentId = string;
type ReferenceId = string;
export type WorkspaceId = string;

export type SimpleComponent<Fields> = {
  workspace: WorkspaceId;
  custom_id: ComponentId;
  type: string;
  name: string;
  parent?: ComponentId;
  description?: string;
  fields?: Fields;
};
export type SimpleReference<Fields> = {
  custom_id: ReferenceId;
  type: string;
  source: ComponentId;
  target: ComponentId;
  description?: string;
  fields?: Fields;
};
export type Graph<ComponentFields, ReferenceFields> = {
  components: SimpleComponent<ComponentFields>[];
  references: SimpleReference<ReferenceFields>[];
};

export type SimpleField = {
  type: FieldType;
  name: LispyString;
  label: string;
  description?: string;
};

export type LocalComponent<Fields> = SimpleComponent<Fields>;
export type LocalReference<Fields> = SimpleReference<Fields> & {
  workspace: WorkspaceId;
};
export type LocalGraph<ComponentFields = {}, ReferenceFields = {}> = {
  components: Record<
    WorkspaceId,
    Record<ComponentId, LocalComponent<ComponentFields>>
  >;
  references: Record<
    WorkspaceId,
    Record<ReferenceId, LocalReference<ReferenceFields>>
  >;
  referenceTypes: Record<WorkspaceId, string[]>;
  componentTypes: Record<WorkspaceId, string[]>;
};

export type RemoteComponent<Fields> = Component &
  Fields & { custom_id: ComponentId };
export type RemoteReference<Fields> = Reference &
  Fields & { custom_id: ReferenceId };
export type RemoteGraph<CF, RF> = {
  components: Record<WorkspaceId, Record<ComponentId, RemoteComponent<CF>>>;
  references: Record<WorkspaceId, Record<ReferenceId, RemoteReference<RF>>>;
};
export type RemoteModel = {
  referenceTypes: Record<WorkspaceId, Record<string, ModelReference>>;
  componentTypes: Record<WorkspaceId, Record<string, ModelComponent>>;
  fields: Record<WorkspaceId, Record<string, Field>>;
};

const REQUIRED_FIELDS: SimpleField[] = [
  {
    type: FieldType.TEXT,
    name: 'custom_id',
    label: 'Integration entity id',
    description: 'Used by Integration Util to track entities',
  },
];

const buildLocalGraph = <CF, RF>(graph: Graph<CF, RF>): LocalGraph<CF, RF> => {
  const cbyi = pivot(graph.components, 'custom_id');
  const components = mapValues(
    group(graph.components, 'workspace'),
    components => pivot(components, 'custom_id')
  );
  const references = mapValues(
    group(
      graph.references.map(reference => ({
        ...reference,
        workspace: cbyi[reference.source].workspace,
      })),
      'workspace'
    ),
    references => pivot(references, 'custom_id')
  );
  const componentTypes = mapValues(components, components =>
    unique(map(components, 'type'))
  );
  const referenceTypes = mapValues(references, references =>
    unique(map(references, 'type'))
  );

  return { components, references, componentTypes, referenceTypes };
};

const buildRemoteModel = (
  model: Record<WorkspaceId, Model>,
  fields: Field[]
): RemoteModel => {
  const fieldsByModel = group(fields, 'model');
  return {
    referenceTypes: mapValues(model, model =>
      mapKeys(model.referenceTypes, 'name')
    ),
    componentTypes: mapValues(model, model => mapKeys(model.root, 'name')),
    fields: mapValues(model, model => pivot(fieldsByModel[model._id], 'name')),
  };
};

const buildRemoteGraph = <CF, RF>(
  workspaces: Record<WorkspaceId, AggregatedWorkspace>
): RemoteGraph<Partial<CF>, Partial<RF>> => ({
  components: mapValues(workspaces, workspace =>
    pivot(
      workspace.components as (Component & Partial<RemoteComponent<CF>>)[],
      'custom_id'
    )
  ),
  references: mapValues(workspaces, workspace =>
    pivot(
      workspace.references as (Reference & Partial<RemoteReference<RF>>)[],
      'custom_id'
    )
  ),
});

export const sync = async <CF, RF>(
  authToken: string,
  org: string,
  workspaces: Record<string, WorkspaceId>,
  graph: Graph<CF, RF>,
  fields: SimpleField[] = [],
  url = 'https://app.ardoq.com/api/'
) => {
  const aqWorkspaces = await mapValuesAsync(workspaces, workspace =>
    getAggregatedWorkspace(url, authToken, org, workspace)
  );

  const aqModels = await mapValuesAsync(aqWorkspaces, workspace =>
    getModel(url, authToken, org, workspace.componentModel)
  );

  const aqFields = await getFields(url, authToken, org);

  const localGraph = buildLocalGraph(graph);
  const remoteModel = buildRemoteModel(aqModels, aqFields);
  const remoteGraph = buildRemoteGraph(aqWorkspaces);

  const diff = calculateDiff(remoteModel, remoteGraph, localGraph, [
    ...fields,
    ...REQUIRED_FIELDS,
  ]);
  console.log(JSON.stringify(diff, null, 2));
};
