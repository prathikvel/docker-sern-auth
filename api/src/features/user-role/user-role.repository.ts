import { db } from "@/config/database";
import { pick } from "@/utils/object.util";

import { UserRole, NewUserRole, UserRoleUpdate } from "./user-role.model";

/** The columns to filter, including all userRole columns. */
const columns = ["urlUsrId", "urlRolId", "urlCreated"] as const;

/**
 * Returns the userRole or undefined if the given `id`s are invalid.
 *
 * @param usrId The userRole's `urlUsrId`
 * @param rolId The userRole's `urlRolId`
 * @returns The userRole or undefined if the given `id`s are invalid
 */
export const findUserRoleById = async (usrId: number, rolId: number) => {
  const query = db
    .selectFrom("userRole")
    .where("urlUsrId", "=", usrId)
    .where("urlRolId", "=", rolId);

  return await query.selectAll().executeTakeFirst();
};

/**
 * Returns an array of userRoles that match the given criteria. Returns all
 * userRoles if no criteria are provided. All the criteria will be compared via
 * equality.
 *
 * @param criteria An object of userRole fields to match with
 * @returns An array of userRoles that match the given criteria
 */
export const findUserRoles = async (criteria: Partial<UserRole> = {}) => {
  const query = db
    .selectFrom("userRole")
    .where((eb) => eb.and(pick(criteria, columns)));

  return await query.selectAll().execute();
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

  return await findUserRoleById(userRole.urlUsrId, userRole.urlRolId);
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

  return await findUserRoleById(usrId, rolId);
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
