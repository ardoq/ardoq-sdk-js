import fetch from 'node-fetch';
import { RateLimit } from 'async-sema';

const encodeQuery = (query: { [key: string]: string }) =>
  Object.entries(query).reduce(
    (acc, [key, value]) =>
      `${acc}${acc.length ? '&' : '?'}${encodeURI(key)}=${encodeURI(value)}`,
    ''
  );

/**
 * Rate limit for api requests.
 *
 * Ardoq's API is generally limited to 50 requests per second, but the component
 * and reference APIs are limited to 30 requests per second. We limit ourselves
 * to 20 requests per second to be properly on the safe side.
 */
const rateLimit = RateLimit(20);

export const fetchArdoq = async <T = unknown>(
  url: string,
  token: string,
  queryParams: { [key: string]: string },
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  await rateLimit();
  const response = await fetch(url + encodeQuery(queryParams), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      Accepts: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Token token=${token}`,
    },
  });

  if (response.status === 204) {
    return {} as any;
  } else if (response.ok) {
    return (await response.json()) as T;
  }
  throw response;
};
