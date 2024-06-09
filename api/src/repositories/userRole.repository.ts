import { db } from "../config/database";
import { UserRole, NewUserRole, UserRoleUpdate } from "../models";
import { pick } from "../utils/object.util";

/** The columns to filter, including all userRole columns. */
const columns = ["url_usr_id", "url_rol_id", "url_created"] as const;

/**
 * Returns the userRole or undefined if the given `id`s are invalid.
 *
 * @param usr_id The userRole's `url_usr_id`
 * @param rol_id The userRole's `url_rol_id`
 * @returns The userRole or undefined if the given `id`s are invalid
 */
export const findUserRoleById = async (usr_id: number, rol_id: number) => {
  const query = db
    .selectFrom("user_role")
    .where("url_usr_id", "=", usr_id)
    .where("url_rol_id", "=", rol_id);

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
    .selectFrom("user_role")
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
  await db.insertInto("user_role").values(userRole).executeTakeFirstOrThrow();

  return await findUserRoleById(userRole.url_usr_id, userRole.url_rol_id);
};

/**
 * Updates the userRole with the given `id`s and returns the updated userRole
 * with {@link findUserRoleById}. Returns undefined if the `id`s are invalid.
 *
 * @param usr_id The userRole's `url_usr_id`
 * @param rol_id The userRole's `url_rol_id`
 * @param updateWith The userRole fields to update with
 * @returns The updated userRole or undefined if the given `id`s are invalid
 */
export const updateUserRole = async (
  usr_id: number,
  rol_id: number,
  updateWith: UserRoleUpdate
) => {
  await db
    .updateTable("user_role")
    .set(updateWith)
    .where("url_usr_id", "=", usr_id)
    .where("url_rol_id", "=", rol_id)
    .execute();

  return await findUserRoleById(usr_id, rol_id);
};

/**
 * Deletes the userRole with the given `id`s and returns the deleted userRole
 * with {@link findUserRoleById}. Returns undefined if the `id`s are invalid.
 *
 * @param usr_id The userRole's `url_usr_id`
 * @param rol_id The userRole's `url_rol_id`
 * @returns The deleted userRole or undefined if the given `id`s are invalid
 */
export const deleteUserRole = async (usr_id: number, rol_id: number) => {
  const userRole = await findUserRoleById(usr_id, rol_id);

  if (userRole) {
    await db
      .deleteFrom("user_role")
      .where("url_usr_id", "=", usr_id)
      .where("url_rol_id", "=", rol_id)
      .execute();
  }

  return userRole;
};
