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
type CustomComponentId = string;
type CustomReferenceId = string;

export type SimpleComponent<Fields> = {
  /**
   * Colloquial name of the workspace this component belongs to
   */
  workspace: WorkspaceId;
  /**
   * The id used to identify components across synchronizations.
   *
   * This field is used to determine when a component should be created,
   * updated or deleted.
   */
  customId: CustomComponentId;
  /**
   * A colloquial name for the type of this reference. Case sensitive.
   *
   * Changing the type name later in Ardoq will only lead to this type name
   * being generated anew on the next synchronization.
   */
  type: string;
  name: string;
  /**
   * The `customId` of the parent component.
   */
  parent?: CustomComponentId;
  description?: string;
  /**
   * A holder for custom fields. Contents of this must match the generic
   * argument `Fields`
   */
  fields?: Fields;
};
export type SimpleReference<Fields> = {
  /**
   * The id used to identify references across synchronizations.
   *
   * This field is used to determine when a reference should be created,
   * updated or deleted.
   */
  customId: CustomReferenceId;
  /**
   * A colloquial name for the type of this reference. Case sensitive.
   *
   * Changing the type name later in Ardoq will only lead to this type name
   * being generated anew on the next synchronization.
   */
  type: string;
  /**
   * The `customId` of the source component
   */
  source: CustomComponentId;
  /**
   * The `customId` of the target component
   */
  target: CustomComponentId;
  description?: string;
  /**
   * A holder for custom fields. Contents of this must match the generic
   * argument `Fields`
   */
  fields?: Fields;
};
/**
 * A representation of a graph.
 *
 * This type is a very simple representation of a graph as a set of components
 * and references.
 *
 * @argument ComponentFields An object type containing the custom fields of the
 *                           components.
 * @argument ReferenceFields An object type containing the custom fields of the
 *                           references.
 */
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
  sourceWorkspace: WorkspaceId;
  targetWorkspace: WorkspaceId;
};
export type LocalGraph<ComponentFields = {}, ReferenceFields = {}> = {
  components: Record<
    WorkspaceId,
    Record<CustomComponentId, LocalComponent<ComponentFields>>
  >;
  references: Record<
    WorkspaceId,
    Record<CustomReferenceId, LocalReference<ReferenceFields>>
  >;
  referenceTypes: Record<WorkspaceId, string[]>;
  componentTypes: Record<WorkspaceId, string[]>;
};

export type RemoteComponent<Fields> = Component &
  Fields & { customId: CustomComponentId };
export type RemoteReference<Fields> = Reference &
  Fields & { customId: CustomReferenceId };
export type RemoteGraph<CF = {}, RF = {}> = {
  components: Record<
    WorkspaceId,
    Record<CustomComponentId, RemoteComponent<CF>>
  >;
  references: Record<
    WorkspaceId,
    Record<CustomReferenceId, RemoteReference<RF>>
  >;
};
export type RemoteModel = {
  referenceTypes: Record<WorkspaceId, Record<string, ModelReference>>;
  componentTypes: Record<WorkspaceId, Record<string, ModelComponent>>;
  fields: Record<WorkspaceId, Record<string, Field>>;
};

export type IdMap = {
  refTypes: Record<WorkspaceId, Record<string, number>>;
  compTypes: Record<WorkspaceId, Record<string, string>>;
  components: Record<CustomComponentId, AqId>;
  /**
   * Mapping from custom component id to the remote id of the workspace defined
   * in the local graph for the component.
   */
  compWorkspaces: Record<CustomComponentId, AqId>;
};
