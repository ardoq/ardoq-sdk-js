import {
  LocalComponent,
  RemoteComponent,
  LocalReference,
  RemoteReference,
} from '../types';
import { SimpleField, WorkspaceName } from '../simpleGraph';

export type Diff<CF = {}, RF = {}> = {
  components: Record<
    WorkspaceName,
    {
      new: LocalComponent<CF>[];
      updated: [RemoteComponent<CF>, LocalComponent<CF>][];
      deleted: RemoteComponent<CF>[];
    }
  >;
  references: Record<
    WorkspaceName,
    {
      new: LocalReference<RF>[];
      updated: [RemoteReference<RF>, LocalReference<RF>][];
      deleted: RemoteReference<RF>[];
    }
  >;
  referenceTypes: Record<
    WorkspaceName,
    {
      new: string[];
    }
  >;
  componentTypes: Record<
    WorkspaceName,
    {
      new: string[];
    }
  >;
  fields: Record<
    WorkspaceName,
    {
      new: SimpleField[];
    }
  >;
};
