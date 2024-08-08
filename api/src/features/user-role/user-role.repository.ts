import { ExpressionBuilder } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/mysql";

import { db } from "@/configs/database.config";
import { Database } from "@/models";
import { pick } from "@/utils/object.util";

import { UserRole, NewUserRole, UserRoleUpdate } from "./user-role.model";

/** The columns to filter, including all userRole columns. */
const columns = ["urlUsrId", "urlRolId", "urlCreated"] as const;

/** The user columns to select, including all user columns except
 * `usrPassword`. */
const userColumns = (eb: ExpressionBuilder<Database, "userRole">) => {
  return jsonArrayFrom(
    eb
      .selectFrom("user")
      .whereRef("usrId", "=", "urlUsrId")
      .select(["usrId", "usrName", "usrEmail", "usrCreated"])
  ).as("users");
};

/** The role columns to select, including all role columns. */
const roleColumns = (eb: ExpressionBuilder<Database, "userRole">) => {
  return jsonArrayFrom(
    eb
      .selectFrom("role")
      .whereRef("rolId", "=", "urlRolId")
      .select(["rolId", "rolName", "rolCreated"])
  ).as("roles");
};

/**
 * Returns the userRole or undefined if the given `id`s are invalid.
 *
 * @param usrId The userRole's `urlUsrId`
 * @param rolId The userRole's `urlRolId`
 * @returns The userRole or undefined if the given `id`s are invalid
 */
export const findUserRoleById = (usrId: number, rolId: number) => {
  const query = db
    .selectFrom("userRole")
    .where("urlUsrId", "=", usrId)
    .where("urlRolId", "=", rolId);

  return query.selectAll().executeTakeFirst();
};

/**
 * Returns the userRole and its roles or undefined if the `usrId` is invalid.
 *
 * @param usrId The userRole's `urlUsrId`
 * @returns The userRole and its roles or undefined if the `usrId` is invalid
 */
export const findUserRoleByUsrId = (usrId: number) => {
  const query = db.selectFrom("userRole").where("urlUsrId", "=", usrId);

  return query.selectAll().select(roleColumns).executeTakeFirst();
};

/**
 * Returns the userRole and its users or undefined if the `rolId` is invalid.
 *
 * @param rolId The userRole's `urlRolId`
 * @returns The userRole and its users or undefined if the `rolId` is invalid
 */
export const findUserRoleByRolId = (rolId: number) => {
  const query = db.selectFrom("userRole").where("urlRolId", "=", rolId);

  return query.selectAll().select(userColumns).executeTakeFirst();
};

/**
 * Returns an array of userRoles that match the given criteria. Returns all
 * userRoles if no criteria are provided. All the criteria will be compared via
 * equality.
 *
 * @param criteria An object of userRole fields to match with
 * @returns An array of userRoles that match the given criteria
 */
export const findUserRoles = (criteria: Partial<UserRole> = {}) => {
  const query = db
    .selectFrom("userRole")
    .where((eb) => eb.and(pick(criteria, columns)));

  return query.selectAll().execute();
};

/**
 * Returns an array of userRoles and their roles that have the given `usrId`s.
 *
 * @param usrIds An array of `urlUsrId`s
 * @returns An array of userRoles and their roles that have the given `usrId`s
 */
export const findUserRolesByUsrIds = (usrIds: number[]) => {
  const query = db.selectFrom("userRole").where("urlUsrId", "in", usrIds);

  return query.selectAll().select(roleColumns).execute();
};

/**
 * Returns an array of userRoles and their users that have the given `rolId`s.
 *
 * @param rolIds An array of `urlRolId`s
 * @returns An array of userRoles and their users that have the given `rolId`s
 */
export const findUserRolesByRolIds = (rolIds: number[]) => {
  const query = db.selectFrom("userRole").where("urlRolId", "in", rolIds);

  return query.selectAll().select(userColumns).execute();
};

/**
 * Inserts a new userRole in the database and returns the newly created userRole
 * with {@link findUserRoleById}. Throws a NoResultError if the userRole couldn't
 * be created.
 *
 * @param userRole The new userRole to add
 * @returns The newly created userRole
 * @throws NoResultError if the userRole was unable to be created
 */
export const createUserRole = async (userRole: NewUserRole) => {
  await db.insertInto("userRole").values(userRole).executeTakeFirstOrThrow();

  return findUserRoleById(userRole.urlUsrId, userRole.urlRolId);
};

/**
 * Updates the userRole with the given `id`s and returns the updated userRole
 * with {@link findUserRoleById}. Returns undefined if the `id`s are invalid.
 *
 * @param usrId The userRole's `urlUsrId`
 * @param rolId The userRole's `urlRolId`
 * @param updateWith The userRole fields to update with
 * @returns The updated userRole or undefined if the given `id`s are invalid
 */
export const updateUserRole = async (
  usrId: number,
  rolId: number,
  updateWith: UserRoleUpdate
) => {
  await db
    .updateTable("userRole")
    .set(updateWith)
    .where("urlUsrId", "=", usrId)
    .where("urlRolId", "=", rolId)
    .execute();

  return findUserRoleById(
    updateWith.urlUsrId ?? usrId,
    updateWith.urlRolId ?? rolId
  );
};

/**
 * Deletes the userRole with the given `id`s and returns the deleted userRole
 * with {@link findUserRoleById}. Returns undefined if the `id`s are invalid.
 *
 * @param usrId The userRole's `urlUsrId`
 * @param rolId The userRole's `urlRolId`
 * @returns The deleted userRole or undefined if the given `id`s are invalid
 */
export const deleteUserRole = async (usrId: number, rolId: number) => {
  const userRole = await findUserRoleById(usrId, rolId);

  if (userRole) {
    await db
      .deleteFrom("userRole")
      .where("urlUsrId", "=", usrId)
      .where("urlRolId", "=", rolId)
      .execute();
  }

  return userRole;
};
