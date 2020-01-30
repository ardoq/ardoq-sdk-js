import { map, reduce } from 'lodash';
import { ModelReference, ModelComponent } from '../ardoq/types';
import { construct } from './utils';

export const collectRefTypes = (
  refTypes: Record<string, ModelReference>
): Record<string, number> =>
  construct(map(refTypes, ({ name, id }) => [name, id]));

export function collectCompTypes(
  compTypes: Record<string, ModelComponent>
): Record<string, string> {
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
