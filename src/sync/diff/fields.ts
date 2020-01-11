import { FieldType, LispyString } from '../../ardoq/types';
import { WorkingModel } from '..';
import { mapValues } from 'lodash';
import { Diff } from '.';

export type FieldDefinition = {
  type: FieldType;
  name: LispyString;
  label: string;
  description?: string;
};

export const diffFields = (
  { fields: remote }: WorkingModel,
  local: FieldDefinition[]
): Pick<Diff, 'fields'> => ({
  fields: mapValues(remote, fields => ({
    new: local.filter(({ name }) => fields[name] === undefined),
  })),
});
