import { FieldType } from '../ardoq/enums';
import {
  AqComponentTypeName,
  AqReferenceTypeName,
  AqFieldName,
} from '../ardoq/types';

export type WorkspaceName = string;
export type CustomComponentId = string;
export type CustomReferenceId = string;

export type SimpleComponent<Fields> = {
  /**
   * Colloquial name of the workspace this component belongs to
   */
  workspace: WorkspaceName;
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
  type: AqComponentTypeName;
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
  type: AqReferenceTypeName;
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

/**
 * Defintion of a custom field.
 *
 * Ardoq uses field definitions to show fields to users and allow users to edit
 * them. They are not necessary for pushing custom fields, and do not affect
 * their storage.
 */
export type SimpleField = {
  type: FieldType;
  /**
   * The name of the field on the reference and component objects.
   *
   * Case sensitive, should not contain spaces or special characters.
   */
  name: AqFieldName;
  /**
   * The label of the field shown to users.
   *
   * Can be changed later in Ardoq without consequence.
   */
  label: string;
  description?: string;
};
