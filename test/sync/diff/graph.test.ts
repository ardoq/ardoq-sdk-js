import {
  IdMap,
  RemoteGraph,
  RemoteComponent,
  RemoteReference,
  LocalGraph,
  SimpleComponent,
  LocalReference,
} from '../../../src/sync/types';
import { EntityType } from '../../../src';
import { diffGraph } from '../../../src/sync/diff/graph';
import { merge } from 'lodash';

const remoteCompFromLocal = (
  local: SimpleComponent<{}>,
  incoming = 0,
  outgoing = 0
): RemoteComponent<{}> => ({
  customId: local.customId,
  _id: `cid#${local.customId}`,
  rootWorkspace: `wid#${local.workspace}`,
  name: local.name,
  type: local.type,
  model: 'mid',
  typeId: `tid#${local.type}`,
  'component-key': local.customId,
  description: null,
  _version: 1,
  _order: 0,
  created: '2020-02-06T10:16:43.000Z',
  'last-updated': '2020-02-06T10:16:43.000Z',
  'created-by': 'uid#',
  'last-modified-by': 'uid#',
  createdByEmail: 'example@example.com',
  createdByName: 'Example User',
  lastModifiedByEmail: 'example@example.com',
  lastModifiedByName: 'Example User',
  children: [],
  parent: null,
  ardoq: {
    'entity-type': EntityType.COMPONENT,
    persistent: null,
    incomingReferenceCount: incoming,
    outgoingReferenceCount: outgoing,
  },
});

const remoteRefFromLocal = (
  local: LocalReference<{}>,
  type = 1
): RemoteReference<{}> => ({
  customId: local.customId,
  _id: `rid#${local.customId}`,
  rootWorkspace: `wid#${local.sourceWorkspace}`,
  source: `cid#${local.source}`,
  targetWorkspace: `wid#${local.targetWorkspace}`,
  target: `cid#${local.target}`,
  type,
  _version: 1,
  created: '2020-02-06T10:16:43.000Z',
  'last-updated': '2020-02-06T10:16:43.000Z',
  'created-by': 'uid#',
  'last-modified-by': 'uid#',
  createdByEmail: 'example@example.com',
  createdByName: 'Example User',
  lastModifiedByEmail: 'example@example.com',
  lastModifiedByName: 'Example User',
  ardoq: {
    'entity-type': EntityType.REFERENCE,
  },
});

const noChange = {
  deleted: [],
  new: [],
  updated: [],
};

describe('Graph diff', function() {
  const localAlpha: SimpleComponent<{}> = {
    customId: 'alpha',
    workspace: 'ws1',
    name: 'Alpha',
    type: 'Node',
  };
  const localBravo: SimpleComponent<{}> = {
    customId: 'bravo',
    workspace: 'ws1',
    name: 'Bravo',
    type: 'Node',
  };
  const localSigma: LocalReference<{}> = {
    customId: 'sigma',
    source: 'alpha',
    target: 'bravo',
    type: 'Edge',
    sourceWorkspace: 'ws1',
    targetWorkspace: 'ws1',
  };

  const remoteAlpha = remoteCompFromLocal(localAlpha, 0, 1);
  const remoteBravo = remoteCompFromLocal(localBravo, 1, 0);
  const remoteSigma = remoteRefFromLocal(localSigma);

  const idMap: IdMap = {
    refTypes: {
      ws1: {
        Edge: remoteSigma.type,
      },
    },
    compTypes: {
      ws1: {
        [remoteAlpha.type]: remoteAlpha.typeId,
      },
    },
    components: {
      [remoteAlpha.customId]: remoteAlpha._id,
      [remoteBravo.customId]: remoteBravo._id,
    },
    compWorkspaces: {
      [remoteAlpha.customId]: remoteAlpha.rootWorkspace,
      [remoteBravo.customId]: remoteBravo.rootWorkspace,
    },
  };
  const remoteGraph: RemoteGraph = {
    components: {
      ws1: {
        alpha: remoteAlpha,
        bravo: remoteBravo,
      },
      ws2: {},
    },
    references: {
      ws1: {
        sigma: remoteSigma,
      },
      ws2: {},
    },
  };
  const localGraphMatchingRemote: LocalGraph = {
    components: {
      ws1: {
        alpha: localAlpha,
        bravo: localBravo,
      },
    },
    references: {
      ws1: {
        sigma: localSigma,
      },
    },
    componentTypes: {
      ws1: [localAlpha.type],
    },
    referenceTypes: {
      ws1: [localSigma.type],
    },
  };
  const emptyDiff = {
    components: {
      ws1: noChange,
      ws2: noChange,
    },
    references: {
      ws1: noChange,
      ws2: noChange,
    },
  };

  test('No changes', function() {
    expect(diffGraph(idMap, remoteGraph, localGraphMatchingRemote)).toEqual(
      emptyDiff
    );
  });

  test('Change workspace of source component of reference', function() {
    const movedAlpha = {
      ...localBravo,
      workspace: 'ws2',
    };
    const movedSigma = {
      ...localSigma,
      sourceWorkspace: 'ws2',
    };
    const localGraph: LocalGraph = {
      ...localGraphMatchingRemote,
      components: {
        ws1: {
          bravo: localBravo,
        },
        ws2: {
          alpha: movedAlpha,
        },
      },
      references: {
        ws2: {
          sigma: movedSigma,
        },
      },
    };

    expect(diffGraph(idMap, remoteGraph, localGraph)).toEqual(
      merge(
        {
          components: {
            ws1: {
              deleted: [remoteAlpha],
            },
            ws2: {
              new: [movedAlpha],
            },
          },
          references: {
            ws1: {
              deleted: [remoteSigma],
            },
            ws2: {
              new: [movedSigma],
            },
          },
        },
        emptyDiff
      )
    );
  });

  test('Change workspace of target component of reference', function() {
    const movedBravo = {
      ...localBravo,
      workspace: 'ws2',
    };
    const updatedSigma = {
      ...localSigma,
      targetWorkspace: 'ws2',
    };
    const localGraph: LocalGraph = {
      ...localGraphMatchingRemote,
      components: {
        ws1: {
          alpha: localAlpha,
        },
        ws2: {
          bravo: movedBravo,
        },
      },
      references: {
        ws1: {
          sigma: updatedSigma,
        },
      },
    };
    const updatedIdMap = {
      ...idMap,
      compWorkspaces: {
        ...idMap.compWorkspaces,
        [movedBravo.customId]: `wid#${movedBravo.workspace}`,
      },
    };

    expect(diffGraph(updatedIdMap, remoteGraph, localGraph)).toEqual(
      merge(
        {
          components: {
            ws1: {
              deleted: [remoteBravo],
            },
            ws2: {
              new: [movedBravo],
            },
          },
          references: {
            ws1: {
              updated: [[remoteSigma, updatedSigma]],
            },
          },
        },
        emptyDiff
      )
    );
  });
});
