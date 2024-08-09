import { Expression, sql } from "kysely";

/**
 * A MySQL helper for aggregating an expression into a JSON array.
 *
 * @param expr An arbitrary SQL expression with a type
 * @returns A `RawBuilder<T[]>` that can be used in query builders
 */
export const jsonArrayFromExpr = <T>(expr: Expression<T>) => {
  return sql<T[]>`cast(coalesce(json_arrayagg(${expr}), '[]') as json)`;
};
