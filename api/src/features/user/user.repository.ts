import { ExpressionBuilder } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/mysql";

import { db } from "@/configs/database.config";
import { Database } from "@/models";
import { pick } from "@/utils/object.util";

import { Role } from "../role";
import { User, NewUser, UserUpdate } from "./user.model";

/** The user columns to select/filter, including all the user columns except
 * `usrPassword`. */
const userColumns = ["usrId", "usrName", "usrEmail", "usrCreated"] as const;

/** The role columns to select/filter, including the `rolId` and `rolName`
 * role columns. */
const roleColumns = ["rolId", "rolName"] as const;

/** The columns to select, including all user columns, except `usrPassword`,
 * and the `rolId` and `rolName` role columns. */
const columnsToSelect = [
  ...userColumns,
  (eb: ExpressionBuilder<Database, "user">) => {
    return jsonArrayFrom(
      eb
        .selectFrom("userRole")
        .whereRef("urlUsrId", "=", "usrId")
        .innerJoin("role", "rolId", "urlRolId")
        .select(roleColumns)
    ).as("roles");
  },
] as const;

/**
 * The generic function to find a user based on a criterion.
 *
 * @param criterion The column name
 * @param criterionValue The value of the criterion
 * @param withPassword If the return object includes `usrPassword`
 * @returns The user or undefined if the given `criterionValue` is invalid
 */
const findUser = <K extends keyof User>(
  criterion: K,
  criterionValue: User[K],
  withPassword: boolean = false
) => {
  const query = db
    .selectFrom("user")
    .where(criterion, "=", criterionValue as any);

  return query
    .select(columnsToSelect)
    .$if(withPassword, (qb) => qb.select("usrPassword"))
    .executeTakeFirst();
};

/**
 * Returns the user and their roles or undefined if the given `id` is invalid.
 * The return object excludes `usrPassword` for security.
 *
 * @param id The user's `usrId`
 * @returns The user and their roles or undefined if the given `id` is invalid
 */
export const findUserById = (id: number) => findUser("usrId", id);

/**
 * Returns the user and their roles or undefined if the given `id` is invalid.
 * The return object includes `usrPassword`.
 *
 * @param id The user's `usrId`
 * @returns The user and their roles or undefined if the given `id` is invalid
 */
export const findUserByIdWithPassword = (id: number) =>
  findUser("usrId", id, true);

/**
 * Returns the user and their roles or undefined if the given `email` is invalid.
 * The return object excludes `usrPassword` for security.
 *
 * @param email The user's `usrEmail`
 * @returns The user and their roles or undefined if the given `email` is invalid
 */
export const findUserByEmail = (email: string) => findUser("usrEmail", email);

/**
 * Returns the user and their roles or undefined if the given `email` is invalid.
 * The return object includes `usrPassword`.
 *
 * @param email The user's `usrEmail`
 * @returns The user and their roles or undefined if the given `email` is invalid
 */
export const findUserByEmailWithPassword = (email: string) =>
  findUser("usrEmail", email, true);

/**
 * Returns an array of users, and their roles, that match the given criteria.
 * Returns all users if no criteria are provided. All criteria will be compared
 * via equality.
 *
 * @param criteria An object of user or role fields to match with
 * @returns An array of users, and their roles, that match the given criteria
 */
export const findUsers = (criteria: Partial<User & Role> = {}) => {
  let query = db
    .selectFrom("user")
    .where((eb) => eb.and(pick(criteria, userColumns)));

  const withRoleCriteria = roleColumns.some((v) => Object.hasOwn(criteria, v));

  if (withRoleCriteria) {
    query = query.where((eb) =>
      eb(
        "usrId",
        "in",
        eb
          .selectFrom("userRole")
          .whereRef("urlUsrId", "=", "usrId")
          .innerJoin("role", "rolId", "urlRolId")
          .where((eb) => eb.and(pick(criteria, roleColumns)))
          .select("urlUsrId")
      )
    );
  }

  return query.select(columnsToSelect).execute();
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
  await db.insertInto("user").values(user).executeTakeFirstOrThrow();

  return findUserById(user.usrId);
};

/**
 * Updates the user with the given `id` and returns the updated user with
 * {@link findUserById}. Returns undefined if the `id` is invalid.
 *
 * @param id The user's `usrId`
 * @param updateWith The user fields to update with
 * @returns The updated user or undefined if the given `id` is invalid
 */
export const updateUser = async (id: number, updateWith: UserUpdate) => {
  await db
    .updateTable("user")
    .set(updateWith)
    .where("usrId", "=", id)
    .execute();

  return findUserById(updateWith.usrId ?? id);
};

/**
 * Deletes the user with the given `id` and returns the deleted user with
 * {@link findUserById}. Returns undefined if the `id` is invalid.
 *
 * @param id The user's `usrId`
 * @returns The deleted user or undefined if the given `id` is invalid
 */
export const deleteUser = async (id: number) => {
  const user = await findUserById(id);

  if (user) {
    await db.deleteFrom("user").where("usrId", "=", id).execute();
  }

  return user;
};
