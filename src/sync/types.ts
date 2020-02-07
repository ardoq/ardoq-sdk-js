import {
  Component,
  Reference,
  ReferenceType,
  ComponentType,
  Field,
  AqId,
  AqComponentTypeName,
  AqReferenceTypeName,
  AqFieldName,
} from '../ardoq/types';
import {
  SimpleComponent,
  SimpleReference,
  CustomComponentId,
  CustomReferenceId,
  WorkspaceName,
} from './simpleGraph';

export type LocalComponent<Fields> = SimpleComponent<Fields>;
export type LocalReference<Fields> = SimpleReference<Fields> & {
  sourceWorkspace: WorkspaceName;
  targetWorkspace: WorkspaceName;
};
export type LocalGraph<ComponentFields = {}, ReferenceFields = {}> = {
  components: Record<
    WorkspaceName,
    Record<CustomComponentId, LocalComponent<ComponentFields>>
  >;
  references: Record<
    WorkspaceName,
    Record<CustomReferenceId, LocalReference<ReferenceFields>>
  >;
  referenceTypes: Record<WorkspaceName, AqComponentTypeName[]>;
  componentTypes: Record<WorkspaceName, AqReferenceTypeName[]>;
};

export type RemoteComponent<Fields> = Component &
  Fields & { customId: CustomComponentId };
export type RemoteReference<Fields> = Reference &
  Fields & { customId: CustomReferenceId };
export type RemoteGraph<CF = {}, RF = {}> = {
  components: Record<
    WorkspaceName,
    Record<CustomComponentId, RemoteComponent<CF>>
  >;
  references: Record<
    WorkspaceName,
    Record<CustomReferenceId, RemoteReference<RF>>
  >;
};
export type RemoteModel = {
  referenceTypes: Record<
    WorkspaceName,
    Record<AqReferenceTypeName, ReferenceType>
  >;
  componentTypes: Record<
    WorkspaceName,
    Record<AqComponentTypeName, ComponentType>
  >;
  fields: Record<WorkspaceName, Record<AqFieldName, Field>>;
};

export type IdMap = {
  refTypes: Record<WorkspaceName, Record<string, number>>;
  compTypes: Record<WorkspaceName, Record<string, string>>;
  components: Record<CustomComponentId, AqId>;
  /**
   * Mapping from custom component id to the remote id of the workspace defined
   * in the local graph for the component.
   */
  compWorkspaces: Record<CustomComponentId, AqId>;
};
