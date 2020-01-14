import { LocalGraph, RemoteModel } from '..';
import { mapValues } from 'lodash';
import { Diff } from '.';

type TypesDiff = Pick<Diff, 'componentTypes' | 'referenceTypes'>;

export const diffTypes = (
  model: RemoteModel,
  { referenceTypes, componentTypes }: LocalGraph
): TypesDiff => ({
  componentTypes: mapValues(model.componentTypes, (model, workspace) => ({
    new: (componentTypes[workspace] || []).filter(
      compType => model[compType] === undefined
    ),
  })),
  referenceTypes: mapValues(model.referenceTypes, (model, workspace) => ({
    new: (referenceTypes[workspace] || []).filter(
      refType => model[refType] === undefined
    ),
  })),
});
