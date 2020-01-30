import {
  WorkspaceId,
  LocalComponent,
  RemoteComponent,
  LocalReference,
  RemoteReference,
  SimpleField,
} from '../types';

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
