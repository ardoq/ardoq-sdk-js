# Ardoq SDK JS

This is an, as of yet, small SDK for developing against the Ardoq API.
It currently constist of two parts:

1.  The API - A set of functions corresponding to the API endpoints of Ardoq,
    with correct typings
2.  A graph syncer - A function that allows you to define a simple graph object
    and update a set of workspaces in Ardoq to match this local graph

Please [open an issue](https://github.com/ardoq/ardoq-sdk-js/issues/new) if
there is any functionality you are missing, or if you find any bugs.

## Usage

### The API

The following example demonstrates how to create a component with the api.

```typescript
import { getAggregatedWorkspace, updateComponent } from 'ardoq-sdk-js';

const apiProps = {
  authToken: '<authentication token>',
  org: 'my-org',
  url: 'https://app.ardoq.com/api/',
};

const main = async () => {
  const workspace = await getAggregatedWorkspace(apiProps, '<workspace id>');
  for (const component of workspace.components) {
    await updateComponent(apiProps, {
      ...component,
      description: (component.description || '') + '\nVisisted by script',
    });
  }
};

main();
```

### The Graph Syncer

The following example demonstrates most of the functionality of the graph
syncer. Notice that the `sync` function will take care of creating the used
types and fields. Fields can be changed locally, and will lead to the components
remotely being updated as long as the `customId`s stay the same.

```typescript
import { sync, FieldType } from "ardoq-sdk-js";

const apiProps = {
  authToken: "<authentication token>",
  org: "my-org",
  url: "https://app.ardoq.com/api/"
};

const fields = [
  {
    name: "excerciseValue",
    label: "Excercise value",
    type: FieldType.NUMBER
  }
];
const workspaces = {
  activities: "<workspace id>",
  equipment: "<workspace id>",
};
const graph = {
  components: [
    {
      customId: "walking",
      workspace: "activities",
      name: "Walking",
      type: "Simple Activity",
      fields: {
        excerciseValue: 10
      }
    },
    {
      customId: "running",
      workspace: "activities",
      name: "Running",
      type: "Simple Activity",
      parent: 'walking',
      fields: {
         excerciseValue: 50
      }
    },
    {
      customId: "sailing",
      workspace: "activities",
      name: "Sailing",
      type: "Complex Activity",
      fields: {
         excerciseValue: 15
      }
    },
    {
      customId: "dinghy",
      workspace: "equipment",
      name: "Dinghy",
      type: "Equipment"
    }
  ],
  references: [
    {
      customId: "sailing-uses-dinghy",
      source: "sailing",
      type: "Uses",
      target: "dinghy",
    },
  ]
};

sync(apiProps, workspaces, graph, fields);
```

## Contributing

There are a few things that could use some work:

- Verify the validity of the graph before attempting sync
- Add more of the api endpoints
- Write more tests for sync

### Developing and testing

- `yarn start` will start continous building (very nice to combine with
  `yarn link` for live testing in another repo)
- `yarn test --watch` will start continous testing

### Cutting a new release

1.  Make sure everything works: `yarn test`
2.  Publish: `yarn publish`
    - **NB**: Make sure to follow schemantic versioning. As long as we are in
      `0.x.x`, make sure to bump the minor version on any change that could break
      existing code.
