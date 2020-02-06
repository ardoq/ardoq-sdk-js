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
  ApiProperties,
} from './types';
import { fetchArdoq } from './fetch';

export const getFields = async ({ url, authToken, org }: ApiProperties) =>
  await fetchArdoq<Field[]>(`${url}field`, authToken, {
    org,
    includeCommon: 'true',
  });

export const createField = async (
  { url, authToken, org }: ApiProperties,
  field: NewField
) => await fetchArdoq<Field>(`${url}field`, authToken, { org }, 'POST', field);

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
  { url, authToken, org }: ApiProperties,
  batchData: {
    op: 'create';
    options: {};
    data: {
      references: Batched<NewReference>[];
      components: Batched<NewComponent>[];
    };
  }
) =>
  await fetchArdoq<BatchResponse>(
    `${url}batch`,
    authToken,
    { org },
    'POST',
    batchData
  );

export const updateComponent = async (
  { url, authToken, org }: ApiProperties,
  component: Component
) =>
  await fetchArdoq<Component>(
    `${url}component/${component._id}`,
    authToken,
    { org },
    'PUT',
    component
  );

export const updateReference = async (
  { url, authToken, org }: ApiProperties,
  reference: Reference
) =>
  await fetchArdoq<Reference>(
    `${url}reference/${reference._id}`,
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
  { url, authToken, org }: ApiProperties,
  payload: {
    componentIds: AqId[];
    requestId?: string;
  }
) =>
  await fetchArdoq<BulkDeleteResponse>(
    `${url}component`,
    authToken,
    { org },
    'DELETE',
    payload
  );

export const deleteReference = async (
  { url, authToken, org }: ApiProperties,
  referenceId: AqId
) =>
  await fetchArdoq(
    // TODO return type
    `${url}reference/${referenceId}`,
    authToken,
    { org },
    'DELETE'
  );

export const getAggregatedWorkspace = async (
  { url, authToken, org }: ApiProperties,
  workspaceId: AqId
) =>
  await fetchArdoq<AggregatedWorkspace>(
    `${url}workspace/${workspaceId}/aggregated`,
    authToken,
    { org }
  );

export const getModel = async (
  { url, authToken, org }: ApiProperties,
  modelId: AqId
) =>
  await fetchArdoq<Model>(`${url}model/${modelId}`, authToken, {
    org,
  });

export const updateModel = async (
  { url, authToken, org }: ApiProperties,
  model: Model
) =>
  await fetchArdoq<Model>(
    `${url}model/${model._id}`,
    authToken,
    { org },
    'PUT',
    model
  );
