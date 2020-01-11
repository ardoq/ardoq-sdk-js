import {
  Field,
  Model,
  Reference,
  Component,
  AqId,
  AggregatedWorkspace,
  NewComponent,
  NewReference,
  NewField,
} from './types';
import { fetchArdoq } from './fetch';

export const getFields = async (url: string, authToken: string, org: string) =>
  await fetchArdoq<Field[]>(url + 'field', authToken, {
    org,
    includeCommon: 'true',
  });

export const createField = async (
  url: string,
  authToken: string,
  org: string,
  field: NewField
) => await fetchArdoq<Field>(url + 'field', authToken, { org }, 'POST', field);

type Batched<T extends {}> = T & { batchId: string };
type BatchResponse = {
  components: {
    [batchId: string]: AqId;
  };
  references: {
    [batchId: string]: AqId;
  };
};

export const batch = async (
  url: string,
  authToken: string,
  org: string,
  batch: {
    op: 'create';
    options: {};
    data: {
      references: Batched<NewReference>[];
      components: Batched<NewComponent>[];
    };
  }
) =>
  await fetchArdoq<BatchResponse>(
    url + 'batch',
    authToken,
    { org },
    'POST',
    batch
  );

export const updateComponent = async (
  url: string,
  authToken: string,
  org: string,
  component: Component
) =>
  await fetchArdoq<Component>(
    url + 'component/' + component._id,
    authToken,
    { org },
    'PUT',
    component
  );

export const updateReference = async (
  url: string,
  authToken: string,
  org: string,
  reference: Reference
) =>
  await fetchArdoq<Reference>(
    url + 'reference/' + reference._id,
    authToken,
    { org },
    'PUT',
    reference
  );

type BulkDeleteResponse = {
  clientRequestId: string | null;
  componentIds: AqId[];
  referenceIds: AqId[];
  updatedTags: unknown[];
};

export const bulkDeleteComponent = async (
  url: string,
  authToken: string,
  org: string,
  payload: {
    componentIds: AqId[];
    requestId?: string;
  }
) =>
  await fetchArdoq<BulkDeleteResponse>(
    url + 'component',
    authToken,
    { org },
    'DELETE',
    payload
  );

export const deleteReference = async (
  url: string,
  authToken: string,
  org: string,
  referenceId: AqId
) =>
  await fetchArdoq(
    // TODO return type
    url + 'reference/' + referenceId,
    authToken,
    { org },
    'DELETE'
  );

export const getAggregatedWorkspace = async (
  url: string,
  authToken: string,
  org: string,
  workspaceId: AqId
) =>
  await fetchArdoq<AggregatedWorkspace>(
    url + 'workspace/' + workspaceId + '/aggregated',
    authToken,
    { org }
  );

export const getModel = async (
  url: string,
  authToken: string,
  org: string,
  modelId: AqId
) =>
  await fetchArdoq<Model>(url + 'model/' + modelId, authToken, {
    org,
  });

export const updateModel = async (
  url: string,
  authToken: string,
  org: string,
  model: Model
) =>
  await fetchArdoq<Model>(
    url + 'model/' + model._id,
    authToken,
    { org },
    'PUT',
    model
  );
