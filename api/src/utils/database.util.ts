import { Expression, sql } from "kysely";

/**
 * A MySQL helper that outputs `trueVal` if the given expression is null and
 * `falseVal` otherwise.
 *
 * @param expr The expression to check for null-ness
 * @param trueVal The value to use if `expr` is null
 * @param falseVal The value to use if `expr` isn't null
 * @returns A RawBuilder that can be used in query builders
 */
export const ifNull = <T, V>(
  expr: Expression<T | null>,
  trueVal: Expression<V>,
  falseVal: Expression<V>
) => {
  return sql<V>`IF(ISNULL(${expr}), ${trueVal}, ${falseVal})`;
};

/**
 * A MySQL helper for aggregating key and value expressions into a JSON object.
 *
 * @param key The expression for the object keys
 * @param value The expression for the object values
 * @returns A RawBuilder that can be used in query builders
 */
export const jsonObjectFromExpr = <K extends string | number, V>(
  key: Expression<K>,
  value: Expression<V>
) => {
  return sql<Record<K, V> | null>`json_objectagg(${key}, ${value})`;
};

/**
 * A MySQL helper for aggregating an expression into a JSON array of values.
 *
 * @param expr An arbitrary SQL expression with a type
 * @returns A RawBuilder that can be used in query builders
 */
export const jsonArrayFromExpr = <T>(expr: Expression<T>) => {
  return sql<T[]>`cast(coalesce(json_arrayagg(${expr}), '[]') as json)`;
};
