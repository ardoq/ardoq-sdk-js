import {
  LocalComponent,
  LocalReference,
  LocalGraph,
  RemoteGraph,
  RemoteComponent,
  RemoteReference,
  IdMap,
} from '../types';
import { hasAllSameAttributes, setIntersection, setDifference } from '../utils';
import { mapValues, keys } from 'lodash';
import { Diff } from './types';

const hasComponentChanged = <Fields>(
  remoteCompIds: Record<string, string>,
  local: LocalComponent<Fields>,
  remote: RemoteComponent<Fields>
) => {
  if (local.name !== remote.name) return true;
  if (local.type !== remote.type) return true;

  const descriptionChanged =
    local.description !== remote.description &&
    (local.description || remote.description);
  if (descriptionChanged) return true;

  const localParent =
    (local.parent && remoteCompIds[local.parent]) || local.parent;
  if (localParent !== (remote.parent || undefined)) return true;

  if (!hasAllSameAttributes(local.fields, remote)) return true;

  return false;
};

const hasReferenceChanged = <Fields>(
  remoteCompIds: Record<string, string>,
  remoteRefTypes: Record<string, number>,
  local: LocalReference<Fields>,
  remote: RemoteReference<Fields>
) => {
  const descriptionChanged =
    local.description !== remote.description &&
    (local.description || remote.description);
  if (descriptionChanged) return true;
  if (remoteRefTypes[local.type] !== remote.type) return true;

  if (remoteCompIds[local.source] !== remote.source) return true;
  if (remoteCompIds[local.target] !== remote.target) return true;

  if (!hasAllSameAttributes(local.fields, remote)) return true;

  return false;
};

export const diffGraph = <CF, RF>(
  ids: IdMap,
  remoteGraph: RemoteGraph<CF, RF>,
  localGraph: LocalGraph<CF, RF>
): Pick<Diff, 'components' | 'references'> => {
  return {
    components: mapValues(remoteGraph.components, (remote, workspace) => ({
      new: setDifference(
        keys(localGraph.components[workspace]),
        keys(remote)
      ).map(component => localGraph.components[workspace][component]),
      deleted: setDifference(
        keys(remote),
        keys(localGraph.components[workspace])
      ).map(component => remote[component]),
      updated: setIntersection(
        keys(remote),
        keys(localGraph.components[workspace])
      )
        .map((component): [RemoteComponent<CF>, LocalComponent<CF>] => [
          remote[component],
          localGraph.components[workspace][component],
        ])
        .filter(([remoteComponent, local]) =>
          hasComponentChanged(ids.components, local, remoteComponent)
        ),
    })),
    references: mapValues(remoteGraph.references, (remote, workspace) => ({
      new: setDifference(
        keys(localGraph.references[workspace]),
        keys(remote)
      ).map(reference => localGraph.references[workspace][reference]),
      deleted: setDifference(
        keys(remote),
        keys(localGraph.references[workspace])
      ).map(reference => remote[reference]),
      updated: setIntersection(
        keys(remote),
        keys(localGraph.references[workspace])
      )
        .map((reference): [RemoteReference<RF>, LocalReference<RF>] => [
          remote[reference],
          localGraph.references[workspace][reference],
        ])
        .filter(([remoteReference, local]) =>
          hasReferenceChanged(
            ids.components,
            ids.refTypes[workspace],
            local,
            remoteReference
          )
        ),
    })),
  };
};
