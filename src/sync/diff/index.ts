import {
  WorkspaceId,
  RemoteModel,
  LocalGraph,
  LocalReference,
  LocalComponent,
  RemoteGraph,
  RemoteComponent,
  RemoteReference,
  SimpleField,
  IdMap,
} from 'sync';
import { diffFields } from './fields';
import { diffTypes } from './types';
import { diffGraph } from './graph';

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
      new: SimpleField[];
    }
  >;
};

export const calculateDiff = <CF, RF>(
  model: RemoteModel,
  remote: RemoteGraph<CF, RF>,
  graph: LocalGraph<CF, RF>,
  ids: IdMap,
  fields: SimpleField[]
): Diff => ({
  ...diffTypes(model, graph),
  ...diffFields(model, fields),
  ...diffGraph(ids, remote, graph),
});
