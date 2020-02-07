import { map, reduce } from 'lodash';
import {
  ReferenceType,
  ComponentType,
  AqReferenceTypeName,
  AqReferenceTypeId,
  AqComponentTypeName,
  AqComponentTypeId,
} from '../ardoq/types';
import { construct } from './utils';

export const collectRefTypes = (
  refTypes: Record<AqReferenceTypeName, ReferenceType>
): Record<AqReferenceTypeName, AqReferenceTypeId> =>
  construct(map(refTypes, ({ name, id }) => [name, id]));

export function collectCompTypes(
  compTypes: Record<AqComponentTypeName, ComponentType>
): Record<AqComponentTypeName, AqComponentTypeId> {
  return reduce(
    compTypes,
    (acc, comp) => ({
      ...acc,
      ...collectCompTypes(comp.children),
      [comp.name]: comp.id,
    }),
    {}
  );
}
