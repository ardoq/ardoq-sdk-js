import {
  LispyString,
  Component,
  Reference,
  ModelReference,
  ModelComponent,
  Field,
  AqId,
} from '../ardoq/types';
import { FieldType } from '../ardoq/enums';

export type WorkspaceId = string;
type ComponentId = string;
type ReferenceId = string;

export type SimpleComponent<Fields> = {
  workspace: WorkspaceId;
  customId: ComponentId;
  type: string;
  name: string;
  parent?: ComponentId;
  description?: string;
  fields?: Fields;
};
export type SimpleReference<Fields> = {
  customId: ReferenceId;
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
  Fields & { customId: ComponentId };
export type RemoteReference<Fields> = Reference &
  Fields & { customId: ReferenceId };
export type RemoteGraph<CF = {}, RF = {}> = {
  components: Record<WorkspaceId, Record<ComponentId, RemoteComponent<CF>>>;
  references: Record<WorkspaceId, Record<ReferenceId, RemoteReference<RF>>>;
};
export type RemoteModel = {
  referenceTypes: Record<WorkspaceId, Record<string, ModelReference>>;
  componentTypes: Record<WorkspaceId, Record<string, ModelComponent>>;
  fields: Record<WorkspaceId, Record<string, Field>>;
};

export type IdMap = {
  refTypes: Record<WorkspaceId, Record<string, number>>;
  compTypes: Record<WorkspaceId, Record<string, string>>;
  components: Record<ComponentId, AqId>;
  compWorkspaces: Record<ComponentId, AqId>;
};
