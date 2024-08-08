import { jsonArrayFrom } from "kysely/helpers/mysql";

import { db } from "@/configs/database.config";
import { pick } from "@/utils/object.util";

import {
  RolePermission,
  NewRolePermission,
  RolePermissionUpdate,
} from "./role-permission.model";

/** The columns to filter, including all rolePermission columns. */
const columns = ["rlpRolId", "rlpPerId", "rlpCreated"] as const;

/**
 * Returns the rolePermission or undefined if the given `id`s are invalid.
 *
 * @param rolId The rolePermission's `rlpRolId`
 * @param perId The rolePermission's `rlpPerId`
 * @returns The rolePermission or undefined if the given `id`s are invalid
 */
export const findRolePermissionById = (rolId: number, perId: number) => {
  const query = db
    .selectFrom("rolePermission")
    .where("rlpRolId", "=", rolId)
    .where("rlpPerId", "=", perId);

  return query.selectAll().executeTakeFirst();
};

/**
 * Returns the rolePermission and its permissions or undefined if the `rolId`
 * is invalid.
 *
 * @param rolId The rolePermission's `rlpRolId`
 * @returns The rolePermission or undefined if the `rolId` is invalid
 */
export const findRolePermissionByRolId = (rolId: number) => {
  const query = db.selectFrom("rolePermission").where("rlpRolId", "=", rolId);

  return query
    .selectAll()
    .select((eb) => {
      return jsonArrayFrom(
        eb
          .selectFrom("permission")
          .whereRef("perId", "=", "rlpPerId")
          .select(["perId", "perSet", "perType", "perEntity", "perCreated"])
      ).as("permissions");
    })
    .executeTakeFirst();
};

/**
 * Returns the rolePermission and its roles or undefined if the `perId` is
 * invalid.
 *
 * @param perId The rolePermission's `rlpPerId`
 * @returns The rolePermission or undefined if the `perId` is invalid
 */
export const findRolePermissionByPerId = (perId: number) => {
  const query = db.selectFrom("rolePermission").where("rlpPerId", "=", perId);

  return query
    .selectAll()
    .select((eb) => {
      return jsonArrayFrom(
        eb
          .selectFrom("role")
          .whereRef("rolId", "=", "rlpRolId")
          .select(["rolId", "rolName", "rolCreated"])
      ).as("roles");
    })
    .executeTakeFirst();
};

/**
 * Returns an array of rolePermissions that match the given criteria. Returns
 * all rolePermissions if no criteria are provided. All the criteria will be
 * compared via equality.
 *
 * @param criteria An object of rolePermission fields to match with
 * @returns An array of rolePermissions that match the given criteria
 */
export const findRolePermissions = (criteria: Partial<RolePermission> = {}) => {
  const query = db
    .selectFrom("rolePermission")
    .where((eb) => eb.and(pick(criteria, columns)));

  return query.selectAll().execute();
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
    .insertInto("rolePermission")
    .values(rolePermission)
    .executeTakeFirstOrThrow();

  const { rlpRolId, rlpPerId } = rolePermission;
  return findRolePermissionById(rlpRolId, rlpPerId);
};

/**
 * Updates the rolePermission with the given `id`s and returns the updated
 * rolePermission with {@link findRolePermissionById}. Returns undefined if the
 * `id`s are invalid.
 *
 * @param rolId The rolePermission's `rlpRolId`
 * @param perId The rolePermission's `rlpPerId`
 * @param updateWith The rolePermission fields to update with
 * @returns The updated rolePermission or undefined if given `id`s are invalid
 */
export const updateRolePermission = async (
  rolId: number,
  perId: number,
  updateWith: RolePermissionUpdate
) => {
  await db
    .updateTable("rolePermission")
    .set(updateWith)
    .where("rlpRolId", "=", rolId)
    .where("rlpPerId", "=", perId)
    .execute();

  return findRolePermissionById(
    updateWith.rlpRolId ?? rolId,
    updateWith.rlpPerId ?? perId
  );
};

/**
 * Deletes the rolePermission with the given `id`s and returns the deleted
 * rolePermission with {@link findRolePermissionById}. Returns undefined if the
 * `id`s are invalid.
 *
 * @param rolId The rolePermission's `rlpRolId`
 * @param perId The rolePermission's `rlpPerId`
 * @returns The deleted rolePermission or undefined if given `id`s are invalid
 */
export const deleteRolePermission = async (rolId: number, perId: number) => {
  const rolePermission = await findRolePermissionById(rolId, perId);

  if (rolePermission) {
    await db
      .deleteFrom("rolePermission")
      .where("rlpRolId", "=", rolId)
      .where("rlpPerId", "=", perId)
      .execute();
  }

  return rolePermission;
};
