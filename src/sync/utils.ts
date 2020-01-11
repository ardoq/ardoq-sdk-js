type Falsy = null | undefined | false | '';

/**
 * Force a value on a type to be not falsy
 */
type Force<T, K extends keyof T> = T &
  {
    [k in K]-?: Exclude<T[k], Falsy>;
  };

export const destruct = <K extends string | number, V>(
  r: Record<K, V>
): [K, V][] => Object.entries(r) as [K, V][];

export const construct = <K extends PropertyKey, V>(
  arr: [K, V][]
): Record<K, V> =>
  arr.reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<K, V>);

const truthyKey = <T, K extends keyof T>(key: K) => (
  element: T
): element is Force<T, K> => Boolean(element[key]);

export const pivot = <T, K extends keyof T>(
  arr: T[],
  key: K
): Record<T[K] & PropertyKey, Force<T, K>> =>
  construct(
    (arr || [])
      .filter(truthyKey(key))
      .map<[T[K] & PropertyKey, Force<T, K>]>(element => [
        element[key] as any,
        element,
      ])
  );

export const group = <T, K extends keyof T>(
  arr: T[],
  key: K
): Record<T[K] & PropertyKey, Force<T, K>[]> =>
  arr
    .filter(truthyKey(key))
    .map<[T[K] & PropertyKey, Force<T, K>]>(element => [
      element[key] as any,
      element,
    ])
    .reduce(
      (acc, [k, v]) => ({ ...acc, [k]: [...(acc[k] || []), v] }),
      {} as Record<T[K] & PropertyKey, Force<T, K>[]>
    );

// export const groupRecord = <T, R extends PropertyKey, K extends keyof T>(
//   arr: Record<R, T>,
//   key: K
// ): Record<T[K] & PropertyKey, Record<R, Force<T, K>>> => null as any;

// export const groupFn = <T, G extends PropertyKey>(
//   arr: T[],
//   fn: (t: T) => G
// ): Record<G, T[]> => null as any;

export const unique = <T>(arr: T[]): T[] => Array.from(new Set(arr));

/**
 * Check if all the attributes defined in target has the same value in test as
 * in target.
 *
 * @param target
 * @param test
 */
export const hasAllSameAttributes = <T>(
  target: T | undefined,
  test: T
): boolean =>
  target === undefined ||
  Object.entries(target).reduce<boolean>(
    (acc, [key, value]) => acc && value === test[key as keyof T],
    true
  );

export const setDifference = <A, B>(a: A[], b: B[]): A[] => {
  const bSet = new Set(b);
  return unique(a.filter(e => !bSet.has(e as any)));
};

export const setIntersection = <A, B>(a: A[], b: B[]): (A & B)[] => {
  const bSet = new Set(b);
  return unique(a.filter((e): e is A & B => bSet.has(e as any)));
};

export const mapValuesAsync = async <K extends string | number, V, R>(
  rec: Record<K, V>,
  mapper: (v: V) => Promise<R>
): Promise<Record<K, R>> =>
  construct(
    await Promise.all(
      destruct(rec).map(
        async ([key, value]): Promise<[K, R]> => [key, await mapper(value)]
      )
    )
  );
