import { jsonArrayFrom } from "kysely/helpers/mysql";

import { db } from "@/configs/database.config";
import { pick } from "@/utils/object.util";

import {
  UserPermission,
  NewUserPermission,
  UserPermissionUpdate,
} from "./user-permission.model";

/** The columns to filter, including all userPermission columns. */
const columns = ["urpUsrId", "urpPerId", "urpCreated"] as const;

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
export const findUserPermissionByUsrId = (usrId: number) => {
  const query = db.selectFrom("userPermission").where("urpUsrId", "=", usrId);

  return query
    .selectAll()
    .select((eb) => {
      return jsonArrayFrom(
        eb
          .selectFrom("permission")
          .whereRef("perId", "=", "urpPerId")
          .select(["perId", "perSet", "perType", "perEntity", "perCreated"])
      ).as("permissions");
    })
    .executeTakeFirst();
};

/**
 * Returns the userPermission and its users or undefined if the `perId` is
 * invalid.
 *
 * @param perId The userPermission's `urpPerId`
 * @returns The userPermission or undefined if the `perId` is invalid
 */
export const findUserPermissionByPerId = (perId: number) => {
  const query = db.selectFrom("userPermission").where("urpPerId", "=", perId);

  return query
    .selectAll()
    .select((eb) => {
      return jsonArrayFrom(
        eb
          .selectFrom("user")
          .whereRef("usrId", "=", "urpUsrId")
          .select(["usrId", "usrName", "usrEmail", "usrCreated"])
      ).as("users");
    })
    .executeTakeFirst();
};

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
