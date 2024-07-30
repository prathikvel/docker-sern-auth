import { db } from "@/configs/database.config";
import { pick } from "@/utils/object.util";
import { convertCamelToSnake, convertSnakeToCamel } from "@/utils/string.util";

import {
  Permission,
  NewPermission,
  PermissionUpdate,
} from "./permission.model";

/** The columns to filter, including all permission columns. */
const columns = ["perId", "perName", "perPblId", "perCreated"] as const;

/** The function signatures for {@link normalizePermission}. */
type NormalizeFunction = {
  (permission?: Permission): Permission | undefined;
  (permission?: Partial<Permission>): Partial<Permission> | undefined;
};

/**
 * Normalizes the given permission by converting the entity set of `perName`
 * from snake_case to camelCase.
 *
 * @param permission The permission to normalize
 * @returns The normalized permission with `perName` converted to camelCase
 */
export const normalizePermission: NormalizeFunction = (permission: any) => {
  if (permission) {
    const [entitySet, type] = permission.perName.split(":");
    permission.perName = `${convertSnakeToCamel(entitySet)}:${type}`;
  }

  return permission;
};

/**
 * The generic function to find a permission based on a criterion.
 *
 * @param criterion The column name
 * @param criterionValue The value of the criterion
 * @returns The permission or undefined if the given `criterionValue` is invalid
 */
const findPermission = async <K extends keyof Permission>(
  criterion: K,
  criterionValue: Permission[K]
) => {
  const query = db
    .selectFrom("permission")
    .where(criterion, "=", criterionValue as any);

  return normalizePermission(await query.selectAll().executeTakeFirst());
};

/**
 * Returns the permission or undefined if the given `id` is invalid.
 *
 * @param id The permission's `perId`
 * @returns The permission or undefined if the given `id` is invalid
 */
export const findPermissionById = (id: number) => findPermission("perId", id);

/**
 * Returns the permission or undefined if the given `name` or `pblId` is
 * invalid.
 *
 * @param name The permission's `perName`
 * @param pblId The permission's `perPblId`
 * @returns The permission or undefined if the given parameters are invalid
 */
export const findPermissionByNamePermissible = async (
  name: string,
  pblId: number | null
) => {
  const query = db
    .selectFrom("permission")
    .where("perName", "=", convertCamelToSnake(name))
    .where("perPblId", pblId === null ? "is" : "=", pblId);

  return normalizePermission(await query.selectAll().executeTakeFirst());
};

/**
 * Returns an array of permissions that match the given criteria. Returns all
 * permissions if no criteria are provided. All the criteria will be compared
 * via equality.
 *
 * @param criteria An object of permission fields to match with
 * @returns An array of permissions that match the given criteria
 */
export const findPermissions = async (criteria: Partial<Permission> = {}) => {
  const { perId, perName, perPblId: pblId, perCreated } = criteria;
  criteria = { perId, perName: convertCamelToSnake(perName), perCreated };

  let query = db
    .selectFrom("permission")
    .where((eb) => eb.and(pick(criteria, columns)));

  if (pblId) {
    query = query.where("perPblId", pblId === null ? "is" : "=", pblId);
  }

  const permissions = await query.selectAll().execute();
  return permissions.map((v) => normalizePermission(v));
};

/**
 * Inserts a new permission in the database and returns the newly created
 * permission with {@link findPermissionById}. Throws a NoResultError if the
 * permission couldn't be created.
 *
 * @param permission The new permission to add
 * @returns The newly created permission
 * @throws NoResultError if the permission was unable to be created
 */
export const createPermission = async (permission: NewPermission) => {
  permission.perName = convertCamelToSnake(permission.perName);

  const { insertId } = await db
    .insertInto("permission")
    .values(permission)
    .executeTakeFirstOrThrow();

  return findPermissionById(Number(insertId!));
};

/**
 * Updates the permission with the given `id` and returns the updated permission
 * with {@link findPermissionById}. Returns undefined if the `id` is invalid.
 *
 * @param id The permission's `perId`
 * @param updateWith The permission fields to update with
 * @returns The updated permission or undefined if the given `id` is invalid
 */
export const updatePermission = async (
  id: number,
  updateWith: PermissionUpdate
) => {
  updateWith.perName = convertCamelToSnake(updateWith.perName);

  await db
    .updateTable("permission")
    .set(updateWith)
    .where("perId", "=", id)
    .execute();

  return findPermissionById(id);
};

/**
 * Deletes the permission with the given `id` and returns the deleted permission
 * with {@link findPermissionById}. Returns undefined if the `id` is invalid.
 *
 * @param id The permission's `perId`
 * @returns The deleted permission or undefined if the given `id` is invalid
 */
export const deletePermission = async (id: number) => {
  const permission = await findPermissionById(id);

  if (permission) {
    await db.deleteFrom("permission").where("perId", "=", id).execute();
  }

  return permission;
};
