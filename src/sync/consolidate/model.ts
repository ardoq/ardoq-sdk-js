import { WorkspaceId } from '../types';
import { destruct, construct } from '../utils';
import { Model, LineStyle, LineEnding } from '../../ardoq/types';
import { map } from 'lodash';
import { updateModel } from '../../ardoq/api';
import { Diff } from '../diff/types';

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

export const consolidateTypes = (
  url: string,
  authToken: string,
  org: string,
  model: Record<WorkspaceId, Model>,
  { referenceTypes, componentTypes }: Diff
) => {
  const { model: newModel, promises } = destruct(model).reduce(
    (acc, [workspace, wsModel]) => {
      const newRefTypes = referenceTypes[workspace].new;
      const newCompTypes = componentTypes[workspace].new;

      if (newRefTypes.length === 0 && newCompTypes.length === 0) {
        return {
          model: { ...acc.model, [workspace]: wsModel },
          promises: acc.promises,
        };
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
            newCompTypes.map(name => {
              const id = randomCompTypeId();
              const compType = { ...COMPONENT_TYPE_DEFAULTS, id, name };
              return [id, compType];
            })
          ),
        },
      };

      const promise = updateModel(url, authToken, org, consolidatedModel);

      return {
        model: { ...acc.model, [workspace]: consolidatedModel },
        promises: [...acc.promises, promise],
      };
    },
    {
      model: {} as Record<WorkspaceId, Model>,
      promises: [] as Promise<unknown>[],
    }
  );

  return [newModel, Promise.all(promises)] as const;
};
