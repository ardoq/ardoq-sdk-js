import { Model } from '../../ardoq/types';
import { WorkspaceId, IdMap, collectCompTypes, collectRefTypes } from '..';
import { Diff } from '../diff';
import { consolidateTypes } from './types';
import { consolidateFields } from './fields';
import { mapValues } from 'lodash';
import { consolidateGraph } from './graph';

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

  ids = {
    ...ids,
    compTypes: mapValues(consolidatedModel, model =>
      collectCompTypes(model.root)
    ),
    refTypes: mapValues(consolidatedModel, model =>
      collectRefTypes(model.referenceTypes)
    ),
  };
  console.log('IDS', JSON.stringify(ids, null, 2));

  await typesPromise;
  await consolidateGraph(url, authToken, org, ids, diff);
  await fieldsPromise;
};
