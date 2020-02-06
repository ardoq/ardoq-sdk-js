import { map } from 'lodash';
import {
  batch,
  updateComponent,
  updateReference,
  bulkDeleteComponent,
  deleteReference,
} from '../../ardoq/api';
import { IdMap } from '../types';
import { Diff } from '../diff/types';
import { ApiProperties } from '../../ardoq/types';

export const consolidateGraph = async (
  apiProperties: ApiProperties,
  ids: IdMap,
  diff: Diff
) => {
  const newReferences = map(diff.references, (wsDiff, workspace) =>
    wsDiff.new.map(ref => ({
      batchId: ref.customId,
      customId: ref.customId,
      rootWorkspace: ids.compWorkspaces[ref.source],
      targetWorkspace: ids.compWorkspaces[ref.target],
      source: ids.components[ref.source],
      target: ids.components[ref.target],
      description: ref.description,
      type: ids.refTypes[workspace][ref.type],
      ...ref.fields,
    }))
  ).flat();
  const newComponents = map(diff.components, (wsDiff, workspace) =>
    wsDiff.new.map(comp => ({
      batchId: comp.customId,
      customId: comp.customId,
      rootWorkspace: ids.compWorkspaces[comp.customId],
      typeId: ids.compTypes[workspace][comp.type],
      description: comp.description || null,
      name: comp.name,
      parent: comp.parent ? ids.components[comp.parent] : null,
    }))
  ).flat();

  let allCompIds = ids.components;
  if (newReferences.length !== 0 || newComponents.length !== 0) {
    const created = await batch(apiProperties, {
      op: 'create',
      options: {},
      data: {
        references: newReferences,
        components: newComponents,
      },
    });

    allCompIds = { ...ids.components, ...created.components };
  }

  for (const workspace in diff.components) {
    for (const [remote, local] of diff.components[workspace].updated) {
      await updateComponent(apiProperties, {
        ...remote,
        name: local.name,
        description: local.description || null,
        typeId: ids.compTypes[workspace][local.type],
        type: local.type,
        parent: local.parent ? allCompIds[local.parent] : null,
        ...local.fields,
      });
    }
  }

  for (const workspace in diff.references) {
    for (const [remote, local] of diff.references[workspace].updated) {
      await updateReference(apiProperties, {
        ...remote,
        description: local.description || null,
        type: ids.refTypes[workspace][local.type],
        source: allCompIds[local.source],
        target: allCompIds[local.target],
        ...local.fields,
      });
    }
  }

  const compIdsToDelete = map(diff.components, ({ deleted }) =>
    map(deleted, '_id')
  ).flat();

  let deletedReferencesSet = new Set();
  if (compIdsToDelete.length !== 0) {
    const deleteComponents = await bulkDeleteComponent(apiProperties, {
      componentIds: compIdsToDelete,
    });
    deletedReferencesSet = new Set(deleteComponents.referenceIds);
  }

  await Promise.all(
    map(diff.references, ({ deleted }) => map(deleted, '_id'))
      .flat()
      .filter(id => !deletedReferencesSet.has(id))
      .map(id => deleteReference(apiProperties, id))
  );
};
