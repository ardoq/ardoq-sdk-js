import { createField } from '../../ardoq/api';
import { Model, ApiProperties } from '../../ardoq/types';
import { Diff } from '../diff/types';
import { WorkspaceName } from '../simpleGraph';

export const consolidateFields = async (
  apiProperties: ApiProperties,
  model: Record<WorkspaceName, Model>,
  { fields }: Diff
) => {
  for (const [workspace, wsFields] of Object.entries(fields)) {
    for (const field of wsFields.new) {
      await createField(apiProperties, {
        global: true,
        globalref: true,
        model: model[workspace]._id,
        ...field,
      });
    }
  }
};
