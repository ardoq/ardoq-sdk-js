import { WorkingGraph, WorkingModel } from 'sync';
import { mapValues } from 'lodash';
import { Diff } from '.';

type TypesDiff = Pick<Diff, 'componentTypes' | 'referenceTypes'>;

export const diffTypes = (
  model: WorkingModel,
  { referenceTypes, componentTypes }: WorkingGraph
): TypesDiff => ({
  componentTypes: mapValues(componentTypes, (compTypes, workspace) => ({
    new: compTypes.filter(
      compType => model.componentTypes[workspace][compType] === undefined
    ),
  })),
  referenceTypes: mapValues(referenceTypes, (refTypes, workspace) => ({
    new: refTypes.filter(
      refType => model.referenceTypes[workspace][refType] === undefined
    ),
  })),
});
