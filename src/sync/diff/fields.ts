import { mapValues } from 'lodash';
import { RemoteModel, SimpleField } from '..';
import { Diff } from '.';

export const diffFields = (
  { fields: remote }: RemoteModel,
  local: SimpleField[]
): Pick<Diff, 'fields'> => ({
  fields: mapValues(remote, fields => ({
    new: local.filter(({ name }) => fields[name] === undefined),
  })),
});
