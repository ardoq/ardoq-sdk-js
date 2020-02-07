import {
  FieldType,
  EntityType,
  Color,
  Shape,
  Icon,
  LineStyle,
  LineEnding,
  ModelCategory,
} from './enums';

export type OptionalExcept<T, K extends keyof T> = Pick<T, K> & Partial<T>;

export type AqComponentId = string;
export type AqReferenceId = string;
export type AqUserId = string;
export type AqModelId = string;
export type AqWorkspaceId = string;
export type AqId =
  | AqComponentId
  | AqReferenceId
  | AqUserId
  | AqModelId
  | AqWorkspaceId;

export type AqFieldName = string;
export type AqComponentTypeName = string;
export type AqComponentTypeId = string; // `p` followed by a many-digit number
export type AqReferenceTypeName = string;
export type AqReferenceTypeId = number;

export type SvgStyle = string;

export type Persisted = {
  _id: AqId;
  _version: number;
  created: string;
  'last-updated': string;
  'created-by': AqUserId;
  'last-modified-by': AqUserId;
  createdByName: string;
  createdByEmail: string;
  lastModifiedByEmail: string;
  lastModifiedByName: string;
};

export type Origin = unknown;

type MinimalField = {
  type: FieldType;
  label: string;
  model: AqModelId;
};
export type Field = MinimalField &
  Persisted & {
    description: string | null;
    name: AqFieldName;
    defaultValue: null | string | number | boolean;
    ardoq: {
      'entity-type': EntityType.FIELD;
    };
    componentType?: AqComponentId[];
    referenceType?: AqReferenceId[];
    mustBeSaved?: boolean;
    origin?: Origin;
    required?: boolean;
    global?: boolean;
    globalref?: boolean;
    calculatedFieldSettings?: {
      storedQueryId: AqId;
      dependencyIds: AqId[];
    };
  };
export type NewField = OptionalExcept<Field, keyof MinimalField>;

type MinimalReference = {
  type: AqReferenceTypeId;
  rootWorkspace: AqWorkspaceId;
  targetWorkspace: AqWorkspaceId;
  source: AqComponentId;
  target: AqComponentId;
};
export type Reference = MinimalReference &
  Persisted & {
    ardoq: {
      'entity-type': EntityType.REFERENCE;
    };
    order?: number;
    displayText?: string | null;
    description?: string | null;
    returnValue?: string | null;
    mustBeSaved?: any | null;
    origin?: Origin;
  };
export type NewReference = OptionalExcept<Reference, keyof MinimalReference>;

type MinimalComponent = {
  rootWorkspace: AqWorkspaceId;
  description: string | null;
  name: string;
};
export type Component = MinimalComponent &
  Persisted & {
    _order: number;
    'component-key': string;
    children: AqComponentId[];
    parent: AqComponentId | null;
    model: AqModelId;
    type: AqComponentTypeName;
    typeId: AqComponentTypeId;
    ardoq: {
      'entity-type': EntityType.COMPONENT;
      persistent: null | {
        survey?: null | {
          // TODO
          [surveyId: string]: {
            valid?: boolean;
          };
        };
      };
      incomingReferenceCount: number;
      outgoingReferenceCount: number;
    };
    version?: string;
    isPublic?: boolean;
    origin?: Origin;
    color?: Color;
    shape?: Shape;
    icon?: Icon;
    image?: string;
  };
export type NewComponent = OptionalExcept<Component, keyof MinimalComponent>;

export type ComponentType = {
  id: AqComponentTypeId;
  index: number;
  name: AqComponentTypeName;
  level: number;
  children: {
    [componentTypeId: string]: ComponentType;
  };
  returnsValue: boolean | null;
  color: Color | null;
  icon: Icon | null;
  shape: Shape | null;
  image: string | null;
  standard: string | null;
};
export type ReferenceType = {
  id: AqReferenceTypeId;
  name: AqReferenceTypeName;
  line: LineStyle; // TODO - really not nullable?
  lineEnding: LineEnding; // TODO - really not nullable?
  returnsValue: boolean | null;
  color: Color | null;
  svgStyle: SvgStyle | null;
};
type MinimalModel = {
  name: string;
  description: string | null;
  category: ModelCategory;
  flexible: boolean;
  root: {
    [componentTypeId: string]: ComponentType;
  };
  referenceTypes: {
    // Unsure if the key should be number and whether it makes a difference.
    // The key will be a number, but JS will "cast" it to a string.
    [referenceTypeId: string]: ReferenceType;
  };
  blankTemplate: boolean;
  useAsTemplate: boolean;
  defaultViews: string[];
  startView: string | null;
};
export type Model = MinimalModel &
  Persisted & {
    createdFromTemplate?: AqModelId;
    ardoq: {
      'entity-type': EntityType.MODEL;
    };
  };
export type NewModel = OptionalExcept<Model, keyof MinimalModel>;

// The following types have not been quality assured

export type WorkspaceBase = {
  type: '1';
  name: string;
  description: string;
  componentModel: AqModelId;
};
export type Workspace = WorkspaceBase & {
  references: AqReferenceId[];
  components: AqComponentId[];
};
export type AggregatedWorkspace = WorkspaceBase & {
  components: Component[];
  references: Reference[];
};

/**
 * Properties for connecting to the Ardoq API
 */
export type ApiProperties = {
  /**
   * The URL to connect to. Must use custom domain if the organization has a
   * custom domain.
   *
   * Usually: `https://app.ardoq.com/api/`
   */
  url: string;
  /**
   * Authentication token for the API.
   *
   * Can be generated in Ardoq under Account Preferences and "API and Tokens".
   */
  authToken: string;
  /**
   * The organization slug to use.
   *
   * Can be found under Organization Preferences and "Settings", in the
   * immutable field "Label"
   */
  org: string;
};
