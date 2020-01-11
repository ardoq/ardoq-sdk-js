import {
  LocalComponent,
  LocalReference,
  LocalGraph,
  RemoteGraph,
  RemoteModel,
  RemoteComponent,
  RemoteReference,
} from '..';
import { hasAllSameAttributes, setIntersection, setDifference } from '../utils';
import { Diff } from '.';
import { mapValues, keys } from 'lodash';

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
  model: RemoteModel,
  remote: RemoteGraph<CF, RF>,
  local: LocalGraph<CF, RF>
): Pick<Diff, 'components' | 'references'> => {
  const remoteRefTypes = mapValues(
    model.referenceTypes,
    (referenceTypes): Record<string, number> => mapValues(referenceTypes, 'id')
  );
  const remoteCompIds: Record<
    string,
    Record<string, string>
  > = mapValues(remote.components, components => mapValues(components, '_id'));

  return {
    components: mapValues(remote.components, (remote, workspace) => ({
      new: setDifference(keys(local.components[workspace]), keys(remote)).map(
        component => local.components[workspace][component]
      ),
      deleted: setDifference(
        keys(remote),
        keys(local.components[workspace])
      ).map(component => remote[component]),
      updated: setIntersection(keys(remote), keys(local.components[workspace]))
        .map((component): [RemoteComponent<CF>, LocalComponent<CF>] => [
          remote[component],
          local.components[workspace][component],
        ])
        .filter(([remote, local]) =>
          hasComponentChanged(remoteCompIds[workspace], local, remote)
        ),
    })),
    references: mapValues(remote.references, (remote, workspace) => ({
      new: setDifference(keys(local.references[workspace]), keys(remote)).map(
        reference => local.references[workspace][reference]
      ),
      deleted: setDifference(
        keys(remote),
        keys(local.references[workspace])
      ).map(reference => remote[reference]),
      updated: setIntersection(keys(remote), keys(local.references[workspace]))
        .map((reference): [RemoteReference<RF>, LocalReference<RF>] => [
          remote[reference],
          local.references[workspace][reference],
        ])
        .filter(([remote, local]) =>
          hasReferenceChanged(
            remoteCompIds[workspace],
            remoteRefTypes[workspace],
            local,
            remote
          )
        ),
    })),
  };
};
