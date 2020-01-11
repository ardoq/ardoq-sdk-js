import {
  WorkspaceId,
  WorkingModel,
  WorkingGraph,
  LocalReference,
  LocalComponent,
  WorkingWorkspaces,
} from 'sync';
import { diffFields, FieldDefinition } from './fields';
import { diffTypes } from './types';
import { Component, Reference } from '../../ardoq/types';
import { diffGraph } from './graph';

export type RemoteComponent<Fields> = Component &
  Fields & { custom_id?: string };
export type RemoteReference<Fields> = Reference &
  Fields & { custom_id?: string };

export type Diff<CF = {}, RF = {}> = {
  components: Record<
    WorkspaceId,
    {
      new: LocalComponent<CF>[];
      updated: [RemoteComponent<CF>, LocalComponent<CF>][];
      deleted: RemoteComponent<CF>[];
    }
  >;
  references: Record<
    WorkspaceId,
    {
      new: LocalReference<RF>[];
      updated: [RemoteReference<RF>, LocalReference<RF>][];
      deleted: RemoteReference<RF>[];
    }
  >;
  referenceTypes: Record<
    WorkspaceId,
    {
      new: string[];
    }
  >;
  componentTypes: Record<
    WorkspaceId,
    {
      new: string[];
    }
  >;
  fields: Record<
    WorkspaceId,
    {
      new: FieldDefinition[];
    }
  >;
};

export const calculateDiff = <CF, RF>(
  model: WorkingModel,
  remote: WorkingWorkspaces<CF, RF>,
  graph: WorkingGraph<CF, RF>,
  fields: FieldDefinition[]
): Diff => ({
  ...diffTypes(model, graph),
  ...diffFields(model, fields),
  ...diffGraph(model, remote, graph),
});
