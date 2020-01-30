import fetch from 'node-fetch';

const encodeQuery = (query: { [key: string]: string }) =>
  Object.entries(query).reduce(
    (acc, [key, value]) =>
      `${acc}${acc.length ? '&' : '?'}${encodeURI(key)}=${encodeURI(value)}`,
    ''
  );

export const fetchArdoq = async <T = unknown>(
  url: string,
  token: string,
  queryParams: { [key: string]: string },
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
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
