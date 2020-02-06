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
export type LispyString = string;
export type AqId = string;
export type SvgStyle = string;
export type Persisted = {
  _id: AqId;
  _version: number;
  created: string;
  'last-updated': string;
  'created-by': AqId;
  'last-modified-by': AqId;
  createdByName: string;
  createdByEmail: string;
  lastModifiedByEmail: string;
  lastModifiedByName: string;
};

export type Origin = unknown;

type MinimalField = {
  type: FieldType;
  label: string;
  model: AqId;
};
export type Field = MinimalField &
  Persisted & {
    description: string | null;
    name: LispyString;
    defaultValue: null | string | number | boolean;
    ardoq: {
      'entity-type': EntityType.FIELD;
    };
    componentType?: AqId[];
    referenceType?: AqId[];
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
  type: number;
  rootWorkspace: AqId;
  targetWorkspace: AqId;
  source: AqId;
  target: AqId;
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
  rootWorkspace: AqId;
  description: string | null;
  name: string;
};
export type Component = MinimalComponent &
  Persisted & {
    _order: number;
    'component-key': string;
    children: AqId[];
    parent: AqId | null;
    model: AqId;
    type: string;
    typeId: AqId;
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

export type ModelComponent = {
  id: string;
  index: number;
  name: string;
  level: number;
  children: {
    [componentTypeId: string]: ModelComponent;
  };
  returnsValue: boolean | null;
  color: Color | null;
  icon: Icon | null;
  shape: Shape | null;
  image: string | null;
  standard: string | null;
};
export type ModelReference = {
  id: number;
  name: string;
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
    [componentTypeId: string]: ModelComponent;
  };
  referenceTypes: {
    [referenceTypeId: string]: ModelReference;
  };
  blankTemplate: boolean;
  useAsTemplate: boolean;
  defaultViews: string[];
  startView: string | null;
};
export type Model = MinimalModel &
  Persisted & {
    createdFromTemplate?: AqId;
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
  componentModel: AqId;
};
export type Workspace = WorkspaceBase & {
  references: AqId[];
  components: AqId[];
};
export type AggregatedWorkspace = WorkspaceBase & {
  components: Component[];
  references: Reference[];
};

export type ApiProperties = {
  url: string;
  authToken: string;
  org: string;
};
