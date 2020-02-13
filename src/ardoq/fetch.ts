import fetch, { Response } from 'node-fetch';
import { RateLimit } from 'async-sema';

type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE';

const encodeQuery = (query: { [key: string]: string }) =>
  Object.entries(query).reduce(
    (acc, [key, value]) =>
      `${acc}${acc.length ? '&' : '?'}${encodeURI(key)}=${encodeURI(value)}`,
    ''
  );

const readResponseBody = async (response: Response) =>
  response
    .text()
    .then(text => {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    })
    .catch(err => (err.message ? err.message : 'No message'));

export class RequestError extends Error {
  url: string;
  method: HttpVerb;
  headers: { [k: string]: string };
  requestBody: any;
  status: number;
  statusText: string;
  responseBody: any;

  constructor(
    url: string,
    method: HttpVerb,
    headers: { [k: string]: string },
    requestBody: any,
    response: Response,
    responseBody: any
  ) {
    super(
      `${response.status} ${response.statusText} ${method} ${response.url}`
    );
    this.url = url;
    this.method = method;
    this.headers = headers;
    this.requestBody = requestBody;
    this.status = response.status;
    this.statusText = response.statusText;
    this.responseBody = responseBody;
  }
}

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
  method: HttpVerb = 'GET',
  body?: any
): Promise<T> => {
  await rateLimit();
  const headers = {
    Accepts: 'application/json',
    'User-Agent': 'ardoq-sdk-js/0.1.0',
    'Content-Type': 'application/json',
    Authorization: `Token token=${token}`,
  };
  const response = await fetch(url + encodeQuery(queryParams), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers,
  });

  if (response.status === 204) {
    return {} as any;
  } else if (response.ok) {
    return (await response.json()) as T;
  }

  throw new RequestError(
    url,
    method,
    headers,
    body,
    response,
    await readResponseBody(response)
  );
};
