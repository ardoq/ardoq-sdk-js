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
} from '../ardoq/types';
import { FieldDefinition } from './diff/fields';
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

export type LocalComponent<Fields> = SimpleComponent<Fields>;
export type LocalReference<Fields> = SimpleReference<Fields> & {
  workspace: WorkspaceId;
};
export type RemoteComponent<Fields> = Component &
  Fields & { custom_id: ComponentId };
export type RemoteReference<Fields> = Reference &
  Fields & { custom_id: ReferenceId };

export type WorkingGraph<ComponentFields = {}, ReferenceFields = {}> = {
  components: Record<
    WorkspaceId,
    Record<ComponentId, SimpleComponent<ComponentFields>>
  >;
  references: Record<
    WorkspaceId,
    Record<ReferenceId, LocalReference<ReferenceFields>>
  >;
  referenceTypes: Record<WorkspaceId, string[]>;
  componentTypes: Record<WorkspaceId, string[]>;
};

export type WorkingModel = {
  referenceTypes: Record<WorkspaceId, Record<string, ModelReference>>;
  componentTypes: Record<WorkspaceId, Record<string, ModelComponent>>;
  fields: Record<WorkspaceId, Record<string, Field>>;
};

export type WorkingWorkspaces<CF, RF> = {
  components: Record<WorkspaceId, Record<ComponentId, RemoteComponent<CF>>>;
  references: Record<WorkspaceId, Record<ReferenceId, RemoteReference<RF>>>;
};

const REQUIRED_FIELDS = [
  {
    type: FieldType.TEXT,
    name: 'custom_id',
    label: 'Integration entity id',
    description: 'Used by Integration Util to track entities',
  },
];

const buildWorkingGraph = <CF, RF>(
  graph: Graph<CF, RF>
): WorkingGraph<CF, RF> => {
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

const buildWorkingModel = (
  model: Record<WorkspaceId, Model>,
  fields: Field[]
): WorkingModel => {
  const fieldsByModel = group(fields, 'model');
  return {
    referenceTypes: mapValues(model, model =>
      mapKeys(model.referenceTypes, 'name')
    ),
    componentTypes: mapValues(model, model => mapKeys(model.root, 'name')),
    fields: mapValues(model, model => pivot(fieldsByModel[model._id], 'name')),
  };
};

const buildWorkingWorkspaces = <CF, RF>(
  workspaces: Record<WorkspaceId, AggregatedWorkspace>
): WorkingWorkspaces<Partial<CF>, Partial<RF>> => ({
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

export const updateWorkspace = async <CF, RF>(
  authToken: string,
  org: string,
  workspaces: Record<string, WorkspaceId>,
  graph: Graph<CF, RF>,
  fields: FieldDefinition[] = [],
  url = 'https://app.ardoq.com/api/'
) => {
  const aqWorkspaces = await mapValuesAsync(workspaces, workspace =>
    getAggregatedWorkspace(url, authToken, org, workspace)
  );

  const aqModels = await mapValuesAsync(aqWorkspaces, workspace =>
    getModel(url, authToken, org, workspace.componentModel)
  );

  const aqFields = await getFields(url, authToken, org);

  const workingGraph = buildWorkingGraph(graph);
  const workingModel = buildWorkingModel(aqModels, aqFields);
  const WorkingWorkspaces = buildWorkingWorkspaces(aqWorkspaces);

  const diff = calculateDiff(workingModel, WorkingWorkspaces, workingGraph, [
    ...fields,
    ...REQUIRED_FIELDS,
  ]);
  console.log(JSON.stringify(diff, null, 2));
};
