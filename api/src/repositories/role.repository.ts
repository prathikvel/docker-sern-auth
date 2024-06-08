import { db } from "../config/database";
import { Role, NewRole, RoleUpdate } from "../models";
import { pick } from "../utils/object.util";

/** The columns to compare, including all role columns. */
const columns = ["rol_id", "rol_name", "rol_created"] as const;

/**
 * The generic function to find a role based on a criterion.
 *
 * @param criterion The column name
 * @param criterionValue The value of the criterion
 * @returns The role or undefined if the given `value` is invalid
 */
const findRole = async <K extends keyof Role>(
  criterion: K,
  criterionValue: Role[K]
) => {
  const query = db
    .selectFrom("role")
    .where(criterion, "=", criterionValue as any);

  return await query.selectAll().executeTakeFirst();
};

/**
 * Returns the role or undefined if the given `id` is invalid.
 *
 * @param id The role's `rol_id`
 * @returns The role or undefined if the given `id` is invalid
 */
export const findRoleById = (id: number) => findRole("rol_id", id);

/**
 * Returns the role or undefined if the given `name` is invalid.
 *
 * @param name The role's `rol_name`
 * @returns The role or undefined if the given `name` is invalid
 */
export const findRoleByName = (name: string) => findRole("rol_name", name);

/**
 * Returns an array of roles that match the given criteria. Returns all roles
 * if no criteria are provided. All the criteria will be compared via equality.
 *
 * @param criteria An object of role fields to match with
 * @returns An array of roles that match the given criteria
 */
export const findRoles = async (criteria: Partial<Role> = {}) => {
  const query = db
    .selectFrom("role")
    .where((eb) => eb.and(pick(criteria, columns)));

  return await query.selectAll().execute();
};

/**
 * Inserts a new role in the database and returns the newly created role with
 * {@link findRoleById}. Throws a NoResultError if the role couldn't be created.
 *
 * @param role The new role to add
 * @returns The newly created role
 * @throws NoResultError if the role was unable to be created
 */
export const createRole = async (role: NewRole) => {
  const { insertId } = await db
    .insertInto("role")
    .values(role)
    .executeTakeFirstOrThrow();

  return await findRoleById(Number(insertId!));
};

/**
 * Updates the role with the given `id` and returns the updated role with
 * {@link findRoleById}. Returns undefined if the `id` is invalid.
 *
 * @param id The role's `rol_id`
 * @param updateWith The role fields to update with
 * @returns The updated role or undefined if the given `id` is invalid
 */
export const updateRole = async (id: number, updateWith: RoleUpdate) => {
  await db
    .updateTable("role")
    .set(updateWith)
    .where("rol_id", "=", id)
    .execute();

  return await findRoleById(id);
};

/**
 * Deletes the role with the given `id` and returns the deleted role with
 * {@link findRoleById}. Returns undefined if the `id` is invalid.
 *
 * @param id The role's `rol_id`
 * @returns The deleted role or undefined if the given `id` is invalid
 */
export const deleteRole = async (id: number) => {
  const role = await findRoleById(id);

  if (role) {
    await db.deleteFrom("role").where("rol_id", "=", id).execute();
  }

  return role;
};
