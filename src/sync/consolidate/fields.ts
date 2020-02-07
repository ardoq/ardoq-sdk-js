import { destruct } from '../utils';
import { createField } from '../../ardoq/api';
import { Model, ApiProperties } from '../../ardoq/types';
import { Diff } from '../diff/types';
import { WorkspaceName } from '../simpleGraph';

export const consolidateFields = async (
  apiProperties: ApiProperties,
  model: Record<WorkspaceName, Model>,
  { fields }: Diff
) =>
  await Promise.all(
    destruct(fields).flatMap(([workspace, wsFields]) =>
      wsFields.new.map(field =>
        createField(apiProperties, {
          global: true,
          globalref: true,
          model: model[workspace]._id,
          ...field,
        })
      )
    )
  );
