import { Diff } from '../diff';
import { destruct } from '../utils';
import { createField } from '../../ardoq/api';
import { Model } from '../../ardoq/types';
import { WorkspaceId } from '..';

export const consolidateFields = async (
  url: string,
  authToken: string,
  org: string,
  model: Record<WorkspaceId, Model>,
  { fields }: Diff
) =>
  await Promise.all(
    destruct(fields).flatMap(([workspace, fields]) =>
      fields.new.map(field =>
        createField(url, authToken, org, {
          global: true,
          globalref: true,
          model: model[workspace]._id,
          ...field,
        })
      )
    )
  );
