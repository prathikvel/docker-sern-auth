import { db } from "@/configs/database.config";
import { pick } from "@/utils/object.util";

import { Role, NewRole, RoleUpdate } from "./role.model";

/** The columns to filter, including all role columns. */
const columns = ["rolId", "rolName", "rolCreated"] as const;

/**
 * The generic function to find a role based on a criterion.
 *
 * @param criterion The column name
 * @param criterionValue The value of the criterion
 * @returns The role or undefined if the given `criterionValue` is invalid
 */
const findRole = <K extends keyof Role>(
  criterion: K,
  criterionValue: Role[K]
) => {
  const query = db
    .selectFrom("role")
    .where(criterion, "=", criterionValue as any);

  return query.selectAll().executeTakeFirst();
};

/**
 * Returns the role or undefined if the given `id` is invalid.
 *
 * @param id The role's `rolId`
 * @returns The role or undefined if the given `id` is invalid
 */
export const findRoleById = (id: number) => findRole("rolId", id);

/**
 * Returns the role or undefined if the given `name` is invalid.
 *
 * @param name The role's `rolName`
 * @returns The role or undefined if the given `name` is invalid
 */
export const findRoleByName = (name: string) => findRole("rolName", name);

/**
 * Returns an array of roles that match the given criteria. Returns all roles
 * if no criteria are provided. All the criteria will be compared via equality.
 *
 * @param criteria An object of role fields to match with
 * @returns An array of roles that match the given criteria
 */
export const findRoles = (criteria: Partial<Role> = {}) => {
  const query = db
    .selectFrom("role")
    .where((eb) => eb.and(pick(criteria, columns)));

  return query.selectAll().execute();
};

/**
 * Returns an array of roles that have the given `id`s.
 *
 * @param ids An array of `rolId`s
 * @returns An array of roles that have the given `id`s
 */
export const findRolesByIds = (ids: number[]) => {
  const query = db.selectFrom("role").where("rolId", "in", ids);

  return query.selectAll().execute();
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
  await db.insertInto("role").values(role).executeTakeFirstOrThrow();

  return findRoleById(role.rolId);
};

/**
 * Updates the role with the given `id` and returns the updated role with
 * {@link findRoleById}. Returns undefined if the `id` is invalid.
 *
 * @param id The role's `rolId`
 * @param updateWith The role fields to update with
 * @returns The updated role or undefined if the given `id` is invalid
 */
export const updateRole = async (id: number, updateWith: RoleUpdate) => {
  await db
    .updateTable("role")
    .set(updateWith)
    .where("rolId", "=", id)
    .execute();

  return findRoleById(updateWith.rolId ?? id);
};

/**
 * Deletes the role with the given `id` and returns the deleted role with
 * {@link findRoleById}. Returns undefined if the `id` is invalid.
 *
 * @param id The role's `rolId`
 * @returns The deleted role or undefined if the given `id` is invalid
 */
export const deleteRole = async (id: number) => {
  const role = await findRoleById(id);

  if (role) {
    await db.deleteFrom("role").where("rolId", "=", id).execute();
  }

  return role;
};
