import { Transaction, sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/mysql";

import { db } from "@/configs/database.config";
import { Database } from "@/models";
import { jsonArrayFromExpr } from "@/utils/database.util";
import { pick } from "@/utils/object.util";

import { Role } from "../role";
import { User } from "../user";
import { UserRole, NewUserRole, UserRoleUpdate } from "./user-role.model";

/** A UserRole with an array of users. */
type UserRoleWithUsers = Pick<UserRole, "urlRolId"> & {
  users: Omit<User, "usrPassword">[];
};

/** A UserRole with an array of roles. */
type UserRoleWithRoles = Pick<UserRole, "urlUsrId"> & { roles: Role[] };

/** The columns to filter, including all userRole columns. */
const columns = ["urlUsrId", "urlRolId", "urlCreated"] as const;

/**
 * The generic function to find userRole(s) with the given `usrId`(s).
 *
 * @param usrId The userRole's `urlUsrId`(s)
 * @returns The userRole(s) and their corresponding roles or undefined
 */
const findByUsrId = (usrId: number | number[]) => {
  const query = db
    .selectFrom((eb) => {
      const innerQuery = eb
        .selectFrom("userRole")
        .where("urlUsrId", typeof usrId === "number" ? "=" : "in", usrId)
        .select((eb) => jsonArrayFromExpr(eb.ref("urlRolId")).as("rolIds"));

      return innerQuery.select("urlUsrId").groupBy("urlUsrId").as("agg");
    })
    .select((eb) => {
      const outerQuery = eb
        .selectFrom("role")
        .whereRef("rolId", sql`MEMBER OF`, eb.parens(eb.ref("rolIds")))
        .select(["rolId", "rolName", "rolCreated"]);

      return ["urlUsrId", jsonArrayFrom(outerQuery).as("roles")];
    });

  return typeof usrId === "number" ? query.executeTakeFirst() : query.execute();
};

/**
 * The generic function to find userRole(s) with the given `rolId`(s).
 *
 * @param rolId The userRole's `urlRolId`(s)
 * @returns The userRole(s) and their corresponding users or undefined
 */
const findByRolId = (rolId: number | number[]) => {
  const query = db
    .selectFrom((eb) => {
      const innerQuery = eb
        .selectFrom("userRole")
        .where("urlRolId", typeof rolId === "number" ? "=" : "in", rolId)
        .select((eb) => jsonArrayFromExpr(eb.ref("urlUsrId")).as("usrIds"));

      return innerQuery.select("urlRolId").groupBy("urlRolId").as("agg");
    })
    .select((eb) => {
      const outerQuery = eb
        .selectFrom("user")
        .whereRef("usrId", sql`MEMBER OF`, eb.parens(eb.ref("usrIds")))
        .select(["usrId", "usrName", "usrEmail", "usrCreated"]);

      return ["urlRolId", jsonArrayFrom(outerQuery).as("users")];
    });

  return typeof rolId === "number" ? query.executeTakeFirst() : query.execute();
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
export const findUserRoleByUsrId = (usrId: number) =>
  findByUsrId(usrId) as Promise<UserRoleWithRoles | undefined>;

/**
 * Returns the userRole and its users or undefined if the `rolId` is invalid.
 *
 * @param rolId The userRole's `urlRolId`
 * @returns The userRole and its users or undefined if the `rolId` is invalid
 */
export const findUserRoleByRolId = (rolId: number) =>
  findByRolId(rolId) as Promise<UserRoleWithUsers | undefined>;

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
export const findUserRolesByUsrIds = (usrIds: number[]) =>
  findByUsrId(usrIds) as Promise<UserRoleWithRoles[]>;

/**
 * Returns an array of userRoles and their users that have the given `rolId`s.
 *
 * @param rolIds An array of `urlRolId`s
 * @returns An array of userRoles and their users that have the given `rolId`s
 */
export const findUserRolesByRolIds = (rolIds: number[]) =>
  findByRolId(rolIds) as Promise<UserRoleWithUsers[]>;

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
 * Inserts a new userRole in the database with the transaction builder. Throws
 * a NoResultError and rolls back the transaction if the userRole couldn't be
 * created.
 *
 * @param trx The transaction builder
 * @param userRole The new userRole to add
 * @returns The newly created userRole
 * @throws NoResultError if the userRole was unable to be created
 */
export const trxCreateUserRole = (
  trx: Transaction<Database>,
  userRole: NewUserRole
) => {
  return trx.insertInto("userRole").values(userRole).executeTakeFirstOrThrow();
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
