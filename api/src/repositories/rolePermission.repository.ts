import { db } from "../config/database";
import {
  RolePermission,
  NewRolePermission,
  RolePermissionUpdate,
} from "../models";
import { pick } from "../utils/object.util";

/** The columns to compare, including all rolePermission columns. */
const columns = ["rlp_rol_id", "rlp_per_id", "rlp_created"] as const;

/**
 * Returns the rolePermission or undefined if the given `id`s are invalid.
 *
 * @param rol_id The rolePermission's `rlp_rol_id`
 * @param per_id The rolePermission's `rlp_per_id`
 * @returns The rolePermission or undefined if the given `id`s are invalid
 */
export const findRolePermissionById = async (
  rol_id: number,
  per_id: number
) => {
  const query = db
    .selectFrom("role_permission")
    .where("rlp_rol_id", "=", rol_id)
    .where("rlp_per_id", "=", per_id);

  return await query.selectAll().executeTakeFirst();
};

/**
 * Returns an array of rolePermissions that match the given criteria. Returns
 * all rolePermissions if no criteria are provided. All the criteria will be
 * compared via equality.
 *
 * @param criteria An object of rolePermission fields to match with
 * @returns An array of rolePermissions that match the given criteria
 */
export const findRolePermissions = async (
  criteria: Partial<RolePermission> = {}
) => {
  const query = db
    .selectFrom("role_permission")
    .where((eb) => eb.and(pick(criteria, columns)));

  return await query.selectAll().execute();
};

/**
 * Inserts a new rolePermission in the database and returns the newly created
 * rolePermission with {@link findRolePermissionById}. Throws a NoResultError
 * if the rolePermission couldn't be created.
 *
 * @param rolePermission The new rolePermission to add
 * @returns The newly created rolePermission
 * @throws NoResultError if the rolePermission was unable to be created
 */
export const createRolePermission = async (
  rolePermission: NewRolePermission
) => {
  await db
    .insertInto("role_permission")
    .values(rolePermission)
    .executeTakeFirstOrThrow();

  const { rlp_rol_id, rlp_per_id } = rolePermission;
  return await findRolePermissionById(rlp_rol_id, rlp_per_id);
};

/**
 * Updates the rolePermission with the given `id`s and returns the updated
 * rolePermission with {@link findRolePermissionById}. Returns undefined if the
 * `id`s are invalid.
 *
 * @param rol_id The rolePermission's `rlp_rol_id`
 * @param per_id The rolePermission's `rlp_per_id`
 * @param updateWith The rolePermission fields to update with
 * @returns The updated rolePermission or undefined if given `id`s are invalid
 */
export const updateRolePermission = async (
  rol_id: number,
  per_id: number,
  updateWith: RolePermissionUpdate
) => {
  await db
    .updateTable("role_permission")
    .set(updateWith)
    .where("rlp_rol_id", "=", rol_id)
    .where("rlp_per_id", "=", per_id)
    .execute();

  return await findRolePermissionById(rol_id, per_id);
};

/**
 * Deletes the rolePermission with the given `id`s and returns the deleted
 * rolePermission with {@link findRolePermissionById}. Returns undefined if the
 * `id`s are invalid.
 *
 * @param rol_id The rolePermission's `rlp_rol_id`
 * @param per_id The rolePermission's `rlp_per_id`
 * @returns The deleted rolePermission or undefined if given `id`s are invalid
 */
export const deleteRolePermission = async (rol_id: number, per_id: number) => {
  const rolePermission = await findRolePermissionById(rol_id, per_id);

  if (rolePermission) {
    await db
      .deleteFrom("role_permission")
      .where("rlp_rol_id", "=", rol_id)
      .where("rlp_per_id", "=", per_id)
      .execute();
  }

  return rolePermission;
};
