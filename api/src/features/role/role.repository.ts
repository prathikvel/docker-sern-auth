import { ExpressionBuilder } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/mysql";

import { db } from "@/configs/database.config";
import { Database } from "@/models";
import { convertPropForDb, convertPropForJs } from "@/utils/database.util";
import { pick } from "@/utils/object.util";

import { Permission } from "../permission";
import { Role, NewRole, RoleUpdate } from "./role.model";

/** The role columns to select/filter, including all role columns. */
const roleColumns = ["rolId", "rolName", "rolCreated"] as const;

/** The permission columns to select/filter, including the `perId`, `perSet`,
 * `perType`, and `perEntity` permission columns. */
const permissionColumns = ["perId", "perSet", "perType", "perEntity"] as const;

/** The columns to select, including all role columns and the `perId`, `perSet`,
 * `perType`, and `perEntity` permission columns. */
const columnsToSelect = [
  ...roleColumns,
  (eb: ExpressionBuilder<Database, "role">) => {
    return jsonArrayFrom(
      eb
        .selectFrom("rolePermission")
        .whereRef("rlpRolId", "=", "rolId")
        .innerJoin("permission", "perId", "rlpPerId")
        .select(permissionColumns)
    ).as("permissions");
  },
] as const;

/**
 * The generic function to find a role based on a criterion.
 *
 * @param criterion The column name
 * @param criterionValue The value of the criterion
 * @returns The role or undefined if the given `criterionValue` is invalid
 */
const findRole = async <K extends keyof Role>(
  criterion: K,
  criterionValue: Role[K]
) => {
  const query = db
    .selectFrom("role")
    .where(criterion, "=", criterionValue as any);

  const role = await query.select(columnsToSelect).executeTakeFirst();
  if (role) {
    const { permissions } = role;
    role.permissions = permissions.map((v) => convertPropForJs(v, "perSet")!);
  }
  return role;
};

/**
 * Returns the role and its permissions or undefined if given `id` is invalid.
 *
 * @param id The role's `rolId`
 * @returns The role and its permissions or undefined if given `id` is invalid
 */
export const findRoleById = (id: number) => findRole("rolId", id);

/**
 * Returns the role and its permissions or undefined if given `name` is invalid.
 *
 * @param name The role's `rolName`
 * @returns The role and its permissions or undefined if given `name` is invalid
 */
export const findRoleByName = (name: string) => findRole("rolName", name);

/**
 * Returns an array of roles, and their permissions, that match the given
 * criteria. Returns all roles if no criteria are provided. All the criteria
 * will be compared via equality.
 *
 * @param criteria An object of role or permission fields to match with
 * @returns An array of roles, and their permissions, that match given criteria
 */
export const findRoles = async (criteria: Partial<Role & Permission> = {}) => {
  let query = db
    .selectFrom("role")
    .where((eb) => eb.and(pick(criteria, roleColumns)));

  const withPermissionCriteria = permissionColumns.some((v) =>
    Object.hasOwn(criteria, v)
  );

  if (withPermissionCriteria) {
    query = query.where((eb) =>
      eb(
        "rolId",
        "in",
        eb
          .selectFrom("rolePermission")
          .whereRef("rlpRolId", "=", "rolId")
          .innerJoin("permission", "perId", "rlpPerId")
          .where((eb) =>
            eb.and(
              pick(convertPropForDb(criteria, "perSet"), permissionColumns)
            )
          )
          .select("rlpRolId")
      )
    );
  }

  const roles = await query.select(columnsToSelect).execute();
  for (const role of roles) {
    const { permissions } = role;
    role.permissions = permissions.map((v) => convertPropForJs(v, "perSet")!);
  }
  return roles;
};

/**
 * Returns an array of roles, and their permissions, that have the given `id`s.
 *
 * @param ids An array of `rolId`s
 * @returns An array of roles, and their permissions, that have the given `id`s
 */
export const findRolesByIds = async (ids: number[]) => {
  const query = db.selectFrom("role").where("rolId", "in", ids);

  const roles = await query.select(columnsToSelect).execute();
  for (const role of roles) {
    const { permissions } = role;
    role.permissions = permissions.map((v) => convertPropForJs(v, "perSet")!);
  }
  return roles;
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
