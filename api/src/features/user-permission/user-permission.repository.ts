import { Transaction, sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/mysql";

import { db } from "@/configs/database.config";
import { Database } from "@/models";
import { jsonArrayFromExpr } from "@/utils/database.util";
import { pick } from "@/utils/object.util";

import { Permission } from "../permission";
import { User } from "../user";
import {
  UserPermission,
  NewUserPermission,
  UserPermissionUpdate,
} from "./user-permission.model";

/** A UserPermission with an array of users. */
type UserPermissionWithUsers = Pick<UserPermission, "urpPerId"> & {
  users: Omit<User, "usrPassword">[];
};

/** A UserPermission with an array of permissions. */
type UserPermissionWithPermissions = Pick<UserPermission, "urpUsrId"> & {
  permissions: Permission[];
};

/** The columns to filter, including all userPermission columns. */
const columns = ["urpUsrId", "urpPerId", "urpCreated"] as const;

/**
 * The generic function to find userPermission(s) with the given `usrId`(s).
 *
 * @param usrId The userPermission's `urpUsrId`(s)
 * @returns The userPermission(s) and their related permissions or undefined
 */
const findByUsrId = (usrId: number | number[]) => {
  const query = db
    .selectFrom((eb) => {
      const innerQuery = eb
        .selectFrom("userPermission")
        .where("urpUsrId", typeof usrId === "number" ? "=" : "in", usrId)
        .select((eb) => jsonArrayFromExpr(eb.ref("urpPerId")).as("perIds"));

      return innerQuery.select("urpUsrId").groupBy("urpUsrId").as("agg");
    })
    .select((eb) => {
      const outerQuery = eb
        .selectFrom("permission")
        .whereRef("perId", sql`MEMBER OF`, eb.parens(eb.ref("perIds")))
        .select(["perId", "perSet", "perType", "perEntity", "perCreated"]);

      return ["urpUsrId", jsonArrayFrom(outerQuery).as("permissions")];
    });

  return typeof usrId === "number" ? query.executeTakeFirst() : query.execute();
};

/**
 * The generic function to find userPermission(s) with the given `perId`(s).
 *
 * @param perId The userPermission's `urpPerId`(s)
 * @returns The userPermission(s) and their corresponding users or undefined
 */
const findByPerId = (perId: number | number[]) => {
  const query = db
    .selectFrom((eb) => {
      const innerQuery = eb
        .selectFrom("userPermission")
        .where("urpPerId", typeof perId === "number" ? "=" : "in", perId)
        .select((eb) => jsonArrayFromExpr(eb.ref("urpUsrId")).as("usrIds"));

      return innerQuery.select("urpPerId").groupBy("urpPerId").as("agg");
    })
    .select((eb) => {
      const outerQuery = eb
        .selectFrom("user")
        .whereRef("usrId", sql`MEMBER OF`, eb.parens(eb.ref("usrIds")))
        .select(["usrId", "usrName", "usrEmail", "usrCreated"]);

      return ["urpPerId", jsonArrayFrom(outerQuery).as("users")];
    });

  return typeof perId === "number" ? query.executeTakeFirst() : query.execute();
};

/**
 * Returns the userPermission or undefined if the given `id`s are invalid.
 *
 * @param usrId The userPermission's `urpUsrId`
 * @param perId The userPermission's `urpPerId`
 * @returns The userPermission or undefined if the given `id`s are invalid
 */
export const findUserPermissionById = (usrId: number, perId: number) => {
  const query = db
    .selectFrom("userPermission")
    .where("urpUsrId", "=", usrId)
    .where("urpPerId", "=", perId);

  return query.selectAll().executeTakeFirst();
};

/**
 * Returns the userPermission and its permissions or undefined if the `usrId`
 * is invalid.
 *
 * @param usrId The userPermission's `urpUsrId`
 * @returns The userPermission or undefined if the `usrId` is invalid
 */
export const findUserPermissionByUsrId = (usrId: number) =>
  findByUsrId(usrId) as Promise<UserPermissionWithPermissions | undefined>;

/**
 * Returns the userPermission and its users or undefined if the `perId` is
 * invalid.
 *
 * @param perId The userPermission's `urpPerId`
 * @returns The userPermission or undefined if the `perId` is invalid
 */
export const findUserPermissionByPerId = (perId: number) =>
  findByPerId(perId) as Promise<UserPermissionWithUsers | undefined>;

/**
 * Returns an array of userPermissions that match the given criteria. Returns
 * all userPermissions if no criteria are provided. All the criteria will be
 * compared via equality.
 *
 * @param criteria An object of userPermission fields to match with
 * @returns An array of userPermissions that match the given criteria
 */
export const findUserPermissions = (criteria: Partial<UserPermission> = {}) => {
  const query = db
    .selectFrom("userPermission")
    .where((eb) => eb.and(pick(criteria, columns)));

  return query.selectAll().execute();
};

/**
 * Returns an array of userPermissions and their permissions that have the given
 * `usrId`s.
 *
 * @param usrIds An array of `urpUsrId`s
 * @returns An array of userPermissions and their permissions that have `usrId`s
 */
export const findUserPermissionsByUsrIds = (usrIds: number[]) =>
  findByUsrId(usrIds) as Promise<UserPermissionWithPermissions[]>;

/**
 * Returns an array of userPermissions and their users that have the given
 * `perId`s.
 *
 * @param perIds An array of `urpPerId`s
 * @returns An array of userPermissions and their users that have the `perId`s
 */
export const findUserPermissionsByPerIds = (perIds: number[]) =>
  findByPerId(perIds) as Promise<UserPermissionWithUsers[]>;

/**
 * Inserts a new userPermission in the database and returns the newly created
 * userPermission with {@link findUserPermissionById}. Throws a NoResultError
 * if the userPermission couldn't be created.
 *
 * @param userPermission The new userPermission to add
 * @returns The newly created userPermission
 * @throws NoResultError if the userPermission was unable to be created
 */
export const createUserPermission = async (
  userPermission: NewUserPermission
) => {
  await db
    .insertInto("userPermission")
    .values(userPermission)
    .executeTakeFirstOrThrow();

  const { urpUsrId, urpPerId } = userPermission;
  return findUserPermissionById(urpUsrId, urpPerId);
};

/**
 * Inserts a new userPermission in the database with the transaction builder.
 * Throws a NoResultError and rolls back the transaction if the userPermission
 * couldn't be created.
 *
 * @param trx The transaction builder
 * @param userPermission The new userPermission to add
 * @returns The newly created userPermission
 * @throws NoResultError if the userPermission was unable to be created
 */
export const trxCreateUserPermission = (
  trx: Transaction<Database>,
  userPermission: NewUserPermission
) => {
  return trx
    .insertInto("userPermission")
    .values(userPermission)
    .executeTakeFirstOrThrow();
};

/**
 * Updates the userPermission with the given `id`s and returns the updated
 * userPermission with {@link findUserPermissionById}. Returns undefined if the
 * `id`s are invalid.
 *
 * @param usrId The userPermission's `urpUsrId`
 * @param perId The userPermission's `urpPerId`
 * @param updateWith The userPermission fields to update with
 * @returns The updated userPermission or undefined if given `id`s are invalid
 */
export const updateUserPermission = async (
  usrId: number,
  perId: number,
  updateWith: UserPermissionUpdate
) => {
  await db
    .updateTable("userPermission")
    .set(updateWith)
    .where("urpUsrId", "=", usrId)
    .where("urpPerId", "=", perId)
    .execute();

  return findUserPermissionById(
    updateWith.urpUsrId ?? usrId,
    updateWith.urpPerId ?? perId
  );
};

/**
 * Deletes the userPermission with the given `id`s and returns the deleted
 * userPermission with {@link findUserPermissionById}. Returns undefined if the
 * `id`s are invalid.
 *
 * @param usrId The userPermission's `urpUsrId`
 * @param perId The userPermission's `urpPerId`
 * @returns The deleted userPermission or undefined if given `id`s are invalid
 */
export const deleteUserPermission = async (usrId: number, perId: number) => {
  const userPermission = await findUserPermissionById(usrId, perId);

  if (userPermission) {
    await db
      .deleteFrom("userPermission")
      .where("urpUsrId", "=", usrId)
      .where("urpPerId", "=", perId)
      .execute();
  }

  return userPermission;
};
