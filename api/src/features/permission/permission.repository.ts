import { db } from "@/configs/database.config";
import { pick } from "@/utils/object.util";
import { convertPropForDb, convertPropForJs } from "@/utils/repository.util";
import { convertCamelToSnake } from "@/utils/string.util";

import {
  Permission,
  NewPermission,
  PermissionUpdate,
} from "./permission.model";

/** The columns to filter, including all permission columns. */
const columns = [
  "perId",
  "perSet",
  "perType",
  "perEntity",
  "perCreated",
] as const;

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

  return convertPropForJs(await query.selectAll().executeTakeFirst(), "perSet");
};

/**
 * Returns the permission or undefined if the given `id` is invalid.
 *
 * @param id The permission's `perId`
 * @returns The permission or undefined if the given `id` is invalid
 */
export const findPermissionById = (id: number) => findPermission("perId", id);

/**
 * Returns the permission or undefined if the given `set`, `type`, or `entity`
 * is invalid.
 *
 * @param set The permission's `perSet`
 * @param type The permission's `perType`
 * @param entity The permission's `perEntity`
 * @returns The permission or undefined if the given parameters are invalid
 */
export const findPermissionBySetTypeEntity = async (
  set: string,
  type: string,
  entity: number | null
) => {
  const query = db
    .selectFrom("permission")
    .where("perSet", "=", convertCamelToSnake(set))
    .where("perType", "=", type)
    .where("perEntity", entity === null ? "is" : "=", entity);

  return convertPropForJs(await query.selectAll().executeTakeFirst(), "perSet");
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
  let entity: Permission["perEntity"] | undefined;
  ({ perEntity: entity, ...criteria } = convertPropForDb(criteria, "perSet"));

  let query = db
    .selectFrom("permission")
    .where((eb) => eb.and(pick(criteria, columns)));

  if (entity) {
    query = query.where("perEntity", entity === null ? "is" : "=", entity);
  }

  const permissions = await query.selectAll().execute();
  return permissions.map((v) => convertPropForJs(v, "perSet"));
};

/**
 * Returns an array of permissions that have the given `id`s.
 *
 * @param ids An array of `perId`s
 * @returns An array of permissions that have the given `id`s
 */
export const findPermissionsByIds = (ids: number[]) => {
  const query = db.selectFrom("permission").where("perId", "in", ids);

  return query.selectAll().execute();
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
  const { insertId } = await db
    .insertInto("permission")
    .values(convertPropForDb(permission, "perSet"))
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
  await db
    .updateTable("permission")
    .set(convertPropForDb(updateWith, "perSet"))
    .where("perId", "=", id)
    .execute();

  return findPermissionById(updateWith.perId ?? id);
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
