import { Model, ApiProperties } from '../../ardoq/types';
import { collectCompTypes, collectRefTypes } from '../collectUtils';
import { consolidateTypes } from './model';
import { consolidateFields } from './fields';
import { mapValues } from 'lodash';
import { consolidateGraph } from './graph';
import { Diff } from '../diff/types';
import { IdMap } from '../types';
import { WorkspaceName } from '../simpleGraph';

export const consolidateDiff = async (
  apiProperties: ApiProperties,
  model: Record<WorkspaceName, Model>,
  diff: Diff,
  ids: IdMap
) => {
  const consolidatedModel = await consolidateTypes(apiProperties, model, diff);
  await consolidateFields(apiProperties, model, diff);

  const updatedIds = {
    ...ids,
    compTypes: mapValues(consolidatedModel, wsModel =>
      collectCompTypes(wsModel.root)
    ),
    refTypes: mapValues(consolidatedModel, wsModel =>
      collectRefTypes(wsModel.referenceTypes)
    ),
  };

  await consolidateGraph(apiProperties, updatedIds, diff);
};
