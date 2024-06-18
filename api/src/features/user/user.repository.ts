import { ExpressionBuilder } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/mysql";

import { db } from "@/config/database";
import { Database } from "@/models";
import { pick } from "@/utils/object.util";

import { Role } from "../role";
import { User, NewUser, UserUpdate } from "./user.model";

/** The user columns to select/filter, including all the user columns except
 * `usr_password`. */
const userColumns = ["usr_id", "usr_name", "usr_email", "usr_created"] as const;

/** The role columns to select/filter, including the `rol_id` and `rol_name`
 * role columns. */
const roleColumns = ["rol_id", "rol_name"] as const;

/** The columns to select, including all user columns, except `usr_password`,
 * and the `rol_id` and `rol_name` role columns. */
const columnsToSelect = [
  ...userColumns,
  (eb: ExpressionBuilder<Database, "user">) => {
    return jsonArrayFrom(
      eb
        .selectFrom("user_role")
        .whereRef("url_usr_id", "=", "usr_id")
        .innerJoin("role", "rol_id", "url_rol_id")
        .select(roleColumns)
    ).as("roles");
  },
] as const;

/**
 * The generic function to find a user based on a criterion.
 *
 * @param criterion The column name
 * @param criterionValue The value of the criterion
 * @param withPassword If the return object includes `usr_password`
 * @returns The user or undefined if the given `criterionValue` is invalid
 */
const findUser = async <K extends keyof User>(
  criterion: K,
  criterionValue: User[K],
  withPassword: boolean = false
) => {
  const query = db
    .selectFrom("user")
    .where(criterion, "=", criterionValue as any);

  return await query
    .select(columnsToSelect)
    .$if(withPassword, (qb) => qb.select("usr_password"))
    .executeTakeFirst();
};

/**
 * Returns the user and their roles or undefined if the given `id` is invalid.
 * The return object excludes `usr_password` for security.
 *
 * @param id The user's `usr_id`
 * @returns The user and their roles or undefined if the given `id` is invalid
 */
export const findUserById = (id: number) => findUser("usr_id", id);

/**
 * Returns the user and their roles or undefined if the given `email` is invalid.
 * The return object excludes `usr_password` for security.
 *
 * @param email The user's `usr_email`
 * @returns The user and their roles or undefined if the given `email` is invalid
 */
export const findUserByEmail = (email: string) => findUser("usr_email", email);

/**
 * Returns the user and their roles or undefined if the given `email` is invalid.
 * The return object includes `usr_password`.
 *
 * @param email The user's `usr_email`
 * @returns The user and their roles or undefined if the given `email` is invalid
 */
export const findUserByEmailWithPassword = (email: string) =>
  findUser("usr_email", email, true);

/**
 * Returns an array of users, and their roles, that match the given criteria.
 * Returns all users if no criteria are provided. All criteria will be compared
 * via equality.
 *
 * @param criteria An object of user or role fields to match with
 * @returns An array of users, and their roles, that match the given criteria
 */
export const findUsers = async (criteria: Partial<User & Role> = {}) => {
  let query = db
    .selectFrom("user")
    .where((eb) => eb.and(pick(criteria, userColumns)));

  const withRoleCriteria = roleColumns.some((v) => Object.hasOwn(criteria, v));

  if (withRoleCriteria) {
    query = query.where((eb) =>
      eb(
        "usr_id",
        "in",
        eb
          .selectFrom("user_role")
          .whereRef("url_usr_id", "=", "usr_id")
          .innerJoin("role", "rol_id", "url_rol_id")
          .where((eb) => eb.and(pick(criteria, roleColumns)))
          .select("url_usr_id")
      )
    );
  }

  return await query.select(columnsToSelect).execute();
};

/**
 * Inserts a new user in the database and returns the newly created user with
 * {@link findUserById}. Throws a NoResultError if the user couldn't be created.
 *
 * @param user The new user to add
 * @returns The newly created user
 * @throws NoResultError if the user was unable to be created
 */
export const createUser = async (user: NewUser) => {
  const { insertId } = await db
    .insertInto("user")
    .values(user)
    .executeTakeFirstOrThrow();

  return await findUserById(Number(insertId!));
};

/**
 * Updates the user with the given `id` and returns the updated user with
 * {@link findUserById}. Returns undefined if the `id` is invalid.
 *
 * @param id The user's `usr_id`
 * @param updateWith The user fields to update with
 * @returns The updated user or undefined if the given `id` is invalid
 */
export const updateUser = async (id: number, updateWith: UserUpdate) => {
  await db
    .updateTable("user")
    .set(updateWith)
    .where("usr_id", "=", id)
    .execute();

  return await findUserById(id);
};

/**
 * Deletes the user with the given `id` and returns the deleted user with
 * {@link findUserById}. Returns undefined if the `id` is invalid.
 *
 * @param id The user's `usr_id`
 * @returns The deleted user or undefined if the given `id` is invalid
 */
export const deleteUser = async (id: number) => {
  const user = await findUserById(id);

  if (user) {
    await db.deleteFrom("user").where("usr_id", "=", id).execute();
  }

  return user;
};