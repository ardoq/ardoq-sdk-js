import { construct } from '../utils';
import { Model, ApiProperties } from '../../ardoq/types';
import { map } from 'lodash';
import { updateModel } from '../../ardoq/api';
import { Diff } from '../diff/types';
import { LineStyle, LineEnding } from '../../ardoq/enums';
import { WorkspaceName } from '../simpleGraph';

const REFERENCE_TYPE_DEFAULTS = {
  line: LineStyle.SOLID,
  lineEnding: LineEnding.BOTH,
  color: null,
  returnsValue: null,
  svgStyle: null,
};

const COMPONENT_TYPE_DEFAULTS = {
  index: 0,
  level: 1,
  children: {},
  color: null,
  icon: null,
  returnsValue: null,
  shape: null,
  image: null,
  standard: null,
};

const randomCompTypeId = () =>
  `p${new Date().getTime() + Math.round(Math.random() * 10000)}`;

export const consolidateTypes = async (
  apiProperties: ApiProperties,
  model: Record<WorkspaceName, Model>,
  { referenceTypes, componentTypes }: Diff
) => {
  const models: Record<WorkspaceName, Model> = {};

  for (const [workspace, wsModel] of Object.entries(model)) {
    const newRefTypes = referenceTypes[workspace].new;
    const newCompTypes = componentTypes[workspace].new;

    if (newRefTypes.length === 0 && newCompTypes.length === 0) {
      models[workspace] = wsModel;
      continue;
    }

    const lastRefId = Math.max(...map(wsModel.referenceTypes, 'id'));

    const consolidatedModel: Model = {
      ...wsModel,
      referenceTypes: {
        ...wsModel.referenceTypes,
        ...construct(
          newRefTypes.map((name, i) => {
            const id = lastRefId + 1 + i;
            const refType = {
              ...REFERENCE_TYPE_DEFAULTS,
              id: lastRefId + 1 + i,
              name,
            };
            return [id, refType];
          })
        ),
      },
      root: {
        ...wsModel.root,
        ...construct(
          newCompTypes.map((name) => {
            const id = randomCompTypeId();
            const compType = { ...COMPONENT_TYPE_DEFAULTS, id, name };
            return [id, compType];
          })
        ),
      },
    };

    await updateModel(apiProperties, consolidatedModel);

    models[workspace] = consolidatedModel;
  }

  return models;
};
