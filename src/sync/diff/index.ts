import { RemoteModel, LocalGraph, RemoteGraph, IdMap } from '../types';
import { SimpleField } from '../simpleGraph';
import { diffFields } from './fields';
import { diffTypes } from './model';
import { diffGraph } from './graph';
import { Diff } from './types';

export const calculateDiff = <
  CF extends Record<string, unknown>,
  RF extends Record<string, unknown>
>(
  model: RemoteModel,
  remote: RemoteGraph<CF, RF>,
  graph: LocalGraph<CF, RF>,
  ids: IdMap,
  fields: SimpleField[]
): Diff => ({
  ...diffTypes(model, graph),
  ...diffFields(model, fields),
  ...diffGraph(ids, remote, graph),
});
