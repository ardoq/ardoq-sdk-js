import { Model, ApiProperties } from '../../ardoq/types';
import { collectCompTypes, collectRefTypes } from '../collectUtils';
import { consolidateTypes } from './model';
import { consolidateFields } from './fields';
import { mapValues } from 'lodash';
import { consolidateGraph } from './graph';
import { Diff } from '../diff/types';
import { WorkspaceId, IdMap } from '../types';

export const consolidateDiff = async (
  apiProperties: ApiProperties,
  model: Record<WorkspaceId, Model>,
  diff: Diff,
  ids: IdMap
) => {
  const [consolidatedModel, typesPromise] = consolidateTypes(
    apiProperties,
    model,
    diff
  );
  const fieldsPromise = consolidateFields(apiProperties, model, diff);

  const updatedIds = {
    ...ids,
    compTypes: mapValues(consolidatedModel, wsModel =>
      collectCompTypes(wsModel.root)
    ),
    refTypes: mapValues(consolidatedModel, wsModel =>
      collectRefTypes(wsModel.referenceTypes)
    ),
  };

  await typesPromise;
  await consolidateGraph(apiProperties, updatedIds, diff);
  await fieldsPromise;
};
