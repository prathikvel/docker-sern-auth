/**
 * This is the checkUserBasedAccess function type. It finds the resource by its
 * `resourceId` or `resourceIds` and checks if the given user has access to it.
 * If the user has access to the given resource, the set of the resource's IDs
 * are returned. Otherwise, it returns undefined.
 *
 * By default, it will use the `resourceId`- which is the value of a resource's
 * ID- to find the resource. If `resourceIds` is defined- which is an object of
 * all of a resource's IDs- it will use only that attribute find the resource.
 *
 * There is a distinction between `resourceId` and `resourceIds` because of two
 * reasons. First, a given resource, or SQL table, may have more than one ID. In
 * this case, a singular `resourceId` alone is not enough to find one resource,
 * and a set of `resourceIds` is necessary. Second, `resourceId` isn't explicit/
 * declarative in what the resource's ID is. For this, `resourceIds` can be used.
 *
 * Here is some example usage:
 *
 * ```
 * // Resource with one ID
 * // ----------------------------
 * // | resource_id | name       |
 * // |--------------------------|
 * // | 1           | John       |
 * // ----------------------------
 *
 * CUBAFunction(someUsrId, 1);
 *   -> { resource_id: 1 }
 *
 * CUBAFunction(someUnauthorizedUsrId, 1);
 *   -> undefined
 *
 * // Resource with multiple IDs
 * // ----------------------------
 * // | resource_id | another_id |
 * // |--------------------------|
 * // | 1           | 2          |
 * // ----------------------------
 *
 * CUBAFunction(someUsrId, null, { resource_id: 1, another_id: 2 });
 *   -> { resource_id: 1, another_id: 2 }
 * ```
 */
export type CUBAFunction<T> = (
  /** The user's `usrId` */
  usrId: number,
  /** The value of the resource's ID */
  resourceId: number | null,
  /** An object of all resource's IDs */
  resourceIds?: Partial<T>
) => Promise<T | undefined>;
