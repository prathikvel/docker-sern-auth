import { Transaction } from "kysely";

import { db } from "@/configs/database.config";
import { Database } from "@/models";

import {
  Permissible,
  NewPermissible,
  PermissibleUpdate,
} from "./permissible.model";

/**
 * Returns the permissible or undefined if the given `id` is invalid.
 *
 * @param id The permissible's `pblId`
 * @returns The permissible or undefined if the given `id` is invalid
 */
export const findPermissibleById = (id: number) => {
  const query = db.selectFrom("permissible").where("pblId", "=", id);

  return query.selectAll().executeTakeFirst();
};

/**
 * Inserts a new permissible in the database and returns the newly created
 * permissible. Throws a NoResultError if the permissible couldn't be created.
 *
 * @param permissible The new permissible to add
 * @returns The newly created permissible
 * @throws NoResultError if the permissible was unable to be created
 */
export const createPermissible = async (permissible: NewPermissible = {}) => {
  const { insertId } = await db
    .insertInto("permissible")
    .values(permissible)
    .executeTakeFirstOrThrow();

  return { pblId: Number(insertId!) } as Permissible;
};

/**
 * Inserts a new permissible in the database with the transaction builder.
 * Throws a NoResultError and rolls back the transaction if the permissible
 * couldn't be created.
 *
 * @param trx The transaction builder
 * @param permissible The new permissible to add
 * @returns The newly created permissible
 * @throws NoResultError if the permissible was unable to be created
 */
export const trxCreatePermissible = (
  trx: Transaction<Database>,
  permissible: NewPermissible
) => {
  return trx
    .insertInto("permissible")
    .values(permissible)
    .executeTakeFirstOrThrow();
};

/**
 * Updates the permissible with given `id` and returns the updated permissible
 * with {@link findPermissibleById}. Returns undefined if the `id` is invalid.
 *
 * @param id The permissible's `pblId`
 * @param updateWith The permissible fields to update with
 * @returns The updated permissible or undefined if the given `id` is invalid
 */
export const updatePermissible = async (
  id: number,
  updateWith: PermissibleUpdate
) => {
  await db
    .updateTable("permissible")
    .set(updateWith)
    .where("pblId", "=", id)
    .execute();

  return findPermissibleById(updateWith.pblId ?? id);
};

/**
 * Deletes the permissible with given `id` and returns the deleted permissible
 * with {@link findPermissibleById}. Returns undefined if the `id` is invalid.
 *
 * @param id The permissible's `pblId`
 * @returns The deleted permissible or undefined if the given `id` is invalid
 */
export const deletePermissible = async (id: number) => {
  const permissible = await findPermissibleById(id);

  if (permissible) {
    await db.deleteFrom("permissible").where("pblId", "=", id).execute();
  }

  return permissible;
};
