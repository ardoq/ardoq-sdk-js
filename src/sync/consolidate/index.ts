import { Model } from '../../ardoq/types';
import { collectCompTypes, collectRefTypes } from '../collectUtils';
import { consolidateTypes } from './model';
import { consolidateFields } from './fields';
import { mapValues } from 'lodash';
import { consolidateGraph } from './graph';
import { Diff } from '../diff/types';
import { WorkspaceId, IdMap } from '../types';

export const consolidateDiff = async (
  url: string,
  authToken: string,
  org: string,
  model: Record<WorkspaceId, Model>,
  diff: Diff,
  ids: IdMap
) => {
  const [consolidatedModel, typesPromise] = consolidateTypes(
    url,
    authToken,
    org,
    model,
    diff
  );
  const fieldsPromise = consolidateFields(url, authToken, org, model, diff);

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
  await consolidateGraph(url, authToken, org, updatedIds, diff);
  await fieldsPromise;
};
