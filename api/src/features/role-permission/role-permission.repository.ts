import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/mysql";

import { db } from "@/configs/database.config";
import { jsonArrayFromExpr } from "@/utils/database.util";
import { pick } from "@/utils/object.util";

import { Permission } from "../permission";
import { Role } from "../role";
import {
  RolePermission,
  NewRolePermission,
  RolePermissionUpdate,
} from "./role-permission.model";

/** A RolePermission with an array of roles. */
type RolePermissionWithRoles = Pick<RolePermission, "rlpPerId"> & {
  roles: Role[];
};

/** A RolePermission with an array of permissions. */
type RolePermissionWithPermissions = Pick<RolePermission, "rlpRolId"> & {
  permissions: Permission[];
};

/** The columns to filter, including all rolePermission columns. */
const columns = ["rlpRolId", "rlpPerId", "rlpCreated"] as const;

/**
 * The generic function to find rolePermission(s) with the given `rolId`(s).
 *
 * @param rolId The rolePermission's `rlpRolId`(s)
 * @returns The rolePermission(s) and their related permissions or undefined
 */
const findByRolId = (rolId: number | number[]) => {
  const query = db
    .selectFrom((eb) => {
      const innerQuery = eb
        .selectFrom("rolePermission")
        .where("rlpRolId", typeof rolId === "number" ? "=" : "in", rolId)
        .select((eb) => jsonArrayFromExpr(eb.ref("rlpPerId")).as("perIds"));

      return innerQuery.select("rlpRolId").groupBy("rlpRolId").as("agg");
    })
    .select((eb) => {
      const outerQuery = eb
        .selectFrom("permission")
        .whereRef("perId", sql`MEMBER OF`, eb.parens(eb.ref("perIds")))
        .select(["perId", "perSet", "perType", "perEntity", "perCreated"]);

      return ["rlpRolId", jsonArrayFrom(outerQuery).as("permissions")];
    });

  return typeof rolId === "number" ? query.executeTakeFirst() : query.execute();
};

/**
 * The generic function to find rolePermission(s) with the given `perId`(s).
 *
 * @param perId The rolePermission's `rlpPerId`(s)
 * @returns The rolePermission(s) and their corresponding roles or undefined
 */
const findByPerId = (perId: number | number[]) => {
  const query = db
    .selectFrom((eb) => {
      const innerQuery = eb
        .selectFrom("rolePermission")
        .where("rlpPerId", typeof perId === "number" ? "=" : "in", perId)
        .select((eb) => jsonArrayFromExpr(eb.ref("rlpRolId")).as("rolIds"));

      return innerQuery.select("rlpPerId").groupBy("rlpPerId").as("agg");
    })
    .select((eb) => {
      const outerQuery = eb
        .selectFrom("role")
        .whereRef("rolId", sql`MEMBER OF`, eb.parens(eb.ref("rolIds")))
        .select(["rolId", "rolName", "rolCreated"]);

      return ["rlpPerId", jsonArrayFrom(outerQuery).as("roles")];
    });

  return typeof perId === "number" ? query.executeTakeFirst() : query.execute();
};

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
export const findRolePermissionByRolId = (rolId: number) =>
  findByRolId(rolId) as Promise<RolePermissionWithPermissions | undefined>;

/**
 * Returns the rolePermission and its roles or undefined if the `perId` is
 * invalid.
 *
 * @param perId The rolePermission's `rlpPerId`
 * @returns The rolePermission or undefined if the `perId` is invalid
 */
export const findRolePermissionByPerId = (perId: number) =>
  findByPerId(perId) as Promise<RolePermissionWithRoles | undefined>;

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
 * Returns an array of rolePermissions and their permissions that have the given
 * `rolId`s.
 *
 * @param rolIds An array of `rlpRolId`s
 * @returns An array of rolePermissions and their permissions that have `rolId`s
 */
export const findRolePermissionsByRolIds = (rolIds: number[]) =>
  findByRolId(rolIds) as Promise<RolePermissionWithPermissions[]>;

/**
 * Returns an array of rolePermissions and their roles that have the given
 * `perId`s.
 *
 * @param perIds An array of `rlpPerId`s
 * @returns An array of rolePermissions and their roles that have the `perId`s
 */
export const findRolePermissionsByPerIds = (perIds: number[]) =>
  findByPerId(perIds) as Promise<RolePermissionWithRoles[]>;

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
