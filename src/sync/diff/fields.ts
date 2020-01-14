import { mapValues } from 'lodash';
import { RemoteModel, SimpleField } from '..';
import { Diff } from '.';

export const diffFields = (
  { fields: remote }: RemoteModel,
  local: SimpleField[]
): Pick<Diff, 'fields'> => ({
  fields: mapValues(remote, remote => ({
    new: local.filter(({ name }) => remote[name] === undefined),
  })),
});
