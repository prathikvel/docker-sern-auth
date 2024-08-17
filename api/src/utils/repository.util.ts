import { ExpressionBuilder, Selectable } from "kysely";

import { Database } from "@/models";
import { attrSorter } from "@/utils/array.util";
import { convertCamelToSnake, convertSnakeToCamel } from "@/utils/string.util";
import { CustomRecord, Id, PickAndNonNull } from "@/utils/types.util";

/** The set of options for repository functions that find many and paginate. */
export type FindManyOptions<T> = {
  sort?: Extract<keyof T, string>;
  order?: "asc" | "desc";
  page?: "next" | "prev";
  cursor?: number;
  limit?: number;
};

/** The parameters for functions that help with find-many-paginate functions. */
type FindManyUtilParams<T, K> = Id<
  // prettier-ignore
  & { id: Extract<K, string> }
  & Pick<FindManyOptions<T>, "page" | "cursor">
  & PickAndNonNull<FindManyOptions<T>, "sort" | "order" | "limit">
>;

/** Helper type to extract select types from the given table on the database. */
type SelectTable<T extends keyof Database> = Selectable<Database[T]>;

/**
 * Converts the property for the given object from camelCase to snake_case.
 *
 * @param obj The object with the property
 * @param prop The property name to convert
 * @returns The given object with the given property converted to snake_case
 */
export const convertPropForDb = <T extends CustomRecord, K extends keyof T>(
  obj: T,
  prop: K
) => {
  if (typeof obj?.[prop] === "string") {
    obj[prop] = convertCamelToSnake(obj[prop] as string) as T[K];
  }

  return obj;
};

/**
 * Converts the property for the given object from snake_case to camelCase.
 *
 * @param obj The object with the property
 * @param prop The property name to convert
 * @returns The given object with the given property converted to camelCase
 */
export const convertPropForJs = <T extends CustomRecord, K extends keyof T>(
  obj: T | undefined,
  prop: K
) => {
  if (typeof obj?.[prop] === "string") {
    obj[prop] = convertSnakeToCamel(obj[prop] as string) as T[K];
  }

  return obj;
};

/**
 * Processes parameters to determine the sorting/order and cursor filter for the
 * table's pagination query. The query's sorting/order can be different than the
 * desired sorting/order depending on the page and order.
 *
 * @param table The name of the database table to paginate
 * @returns The sorting/order and cursor filter for the table's pagination query
 */
export const getPaginateVars = <
  T extends keyof Database,
  K extends keyof Database[T] &
    {
      [K in keyof SelectTable<T>]: SelectTable<T>[K] extends number ? K : never;
    }[keyof SelectTable<T>]
>(
  table: T,
  { id, sort, order, page, cursor }: FindManyUtilParams<Database[T], K>
) => {
  // gets the operation and query order based on the given page and order
  const nextAsc = page === "next" && order === "asc";
  const prevDesc = page === "prev" && order === "desc";
  const cursorOp = nextAsc || prevDesc ? ">" : "<";
  const qOrder = nextAsc || prevDesc ? "asc" : "desc";
  const orderBys = [`${sort} ${qOrder}`, `${id} ${qOrder}`] as const;

  // gets the id filter or attribute filter based on the sorting attribute
  const idCursorFilter = (eb: ExpressionBuilder<Database, T>) =>
    eb(id, cursorOp, cursor as any);
  const cursorSubQuery = (eb: ExpressionBuilder<Database, T>) =>
    // prettier-ignore
    eb.selectFrom(table).where(id, "=", cursor as any).select(sort);
  const attrCursorFilter = (eb: ExpressionBuilder<Database, T>) => {
    const attrUnique = eb(sort, cursorOp, cursorSubQuery as any);
    const attrNotUnique = eb(sort, "=", cursorSubQuery as any);
    return eb.or([attrUnique, eb.and([attrNotUnique, idCursorFilter(eb)])]);
  };
  const cursorFilter = sort === id ? idCursorFilter : attrCursorFilter;

  return { orderBys, cursorFilter };
};

/**
 * Processes data to determine if there are more pages and what the next/prev
 * page cursors are. This requires the length of the data to be `limit + 1` and
 * the sorting/order of the data to be that given by {@link getPaginateVars}.
 *
 * Then, sorts the data according to the given parameters. If a sort parameter
 * is provided, the data will be sorted by that attribute and then by the `id`
 * attribute in ascending order, if the sort attributes for objects are equal.
 *
 * @param data The result of the pagination query
 * @returns The pagination metadata, including hasMore and the next/prev cursors
 */
export const getPaginateMetadataAndSort = <
  T extends Record<K, number>,
  K extends keyof T
>(
  data: T[],
  { id, sort, order, page, limit }: FindManyUtilParams<T, K>
) => {
  const hasMore = Boolean(data.splice(limit, 1).length);
  const cursors: { next?: number | null; prev?: number | null } = {};

  if (!page) {
    cursors.next = hasMore ? data[limit - 1][id] : null;
    cursors.prev = null;
  } else if (page === "next") {
    cursors.next = hasMore ? data[limit - 1][id] : null;
    cursors.prev = data[0][id];
  } else if (page === "prev") {
    cursors.next = data[0][id];
    cursors.prev = hasMore ? data[limit - 1][id] : null;
  }

  data.sort(attrSorter([`${sort} ${order}`, `${id} asc`]));
  return { hasMore, cursors };
};
