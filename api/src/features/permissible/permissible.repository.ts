import { db } from "@/configs/database.config";

import { Permissible, NewPermissible } from "./permissible.model";

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
