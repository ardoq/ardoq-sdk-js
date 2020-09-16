import { LocalGraph, RemoteModel } from '../types';
import { mapValues } from 'lodash';
import { Diff } from './types';

type TypesDiff = Pick<Diff, 'componentTypes' | 'referenceTypes'>;

export const diffTypes = (
  model: RemoteModel,
  { referenceTypes, componentTypes }: LocalGraph
): TypesDiff => ({
  componentTypes: mapValues(
    model.componentTypes,
    (modelComponents, workspace) => ({
      new: (componentTypes[workspace] || []).filter(
        (compType) => modelComponents[compType] === undefined
      ),
    })
  ),
  referenceTypes: mapValues(
    model.referenceTypes,
    (modelReferences, workspace) => ({
      new: (referenceTypes[workspace] || []).filter(
        (refType) => modelReferences[refType] === undefined
      ),
    })
  ),
});
