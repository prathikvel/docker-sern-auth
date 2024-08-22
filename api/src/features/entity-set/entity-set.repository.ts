import { Transaction } from "kysely";

import { db } from "@/configs/database.config";
import { Database } from "@/models";
import { pick } from "@/utils/object.util";
import { convertPropForDb, convertPropForJs } from "@/utils/repository.util";
import { convertCamelToSnake } from "@/utils/string.util";

import { EntitySet, NewEntitySet, EntitySetUpdate } from "./entity-set.model";

/** The columns to filter, including all entitySet columns. */
const columns = ["setId", "setName"] as const;

/**
 * The generic function to find a entitySet based on a criterion.
 *
 * @param criterion The column name
 * @param criterionValue The value of the criterion
 * @returns The entitySet or undefined if the given `criterionValue` is invalid
 */
const findEntitySet = async <K extends keyof EntitySet>(
  criterion: K,
  criterionValue: EntitySet[K]
) => {
  const query = db
    .selectFrom("entitySet")
    .where(criterion, "=", criterionValue as any);

  return convertPropForJs(await query.selectAll().executeTakeFirst(), "setName");
};

/**
 * Returns the entitySet or undefined if the given `id` is invalid.
 *
 * @param id The entitySet's `setId`
 * @returns The entitySet or undefined if the given `id` is invalid
 */
export const findEntitySetById = (id: number) => findEntitySet("setId", id);

/**
 * Returns the entitySet or undefined if the given `name` is invalid.
 *
 * @param name The entitySet's `setName`
 * @returns The entitySet or undefined if the given `name` is invalid
 */
export const findEntitySetByName = async (name: string) => {
  const query = db
    .selectFrom("entitySet")
    .where("setName", "=", convertCamelToSnake(name));

  return convertPropForJs(await query.selectAll().executeTakeFirst(), "setName");
};

/**
 * Returns an array of entitySets that match the given criteria. Returns all
 * entitySets if no criteria are provided. All the criteria will be compared
 * via equality.
 *
 * @param criteria An object of entitySet to match with
 * @returns An array of entitySets that match given criteria
 */
export const findEntitySets = async (criteria: Partial<EntitySet> = {}) => {
  const query = db
    .selectFrom("entitySet")
    .where((eb) =>
      eb.and(pick(convertPropForDb(criteria, "setName"), columns))
    );

  const entitySets = await query.selectAll().execute();
  return entitySets.map((v) => convertPropForJs(v, "setName"));
};

/**
 * Inserts a new entitySet in the database and returns the newly created
 * entitySet with {@link findEntitySetById}. Throws a NoResultError if the
 * entitySet couldn't be created.
 *
 * @param entitySet The new entitySet to add
 * @returns The newly created entitySet
 * @throws NoResultError if the entitySet was unable to be created
 */
export const createEntitySet = async (entitySet: NewEntitySet) => {
  const { insertId } = await db
    .insertInto("entitySet")
    .values(convertPropForDb(entitySet, "setName"))
    .executeTakeFirstOrThrow();

  return findEntitySetById(Number(insertId!));
};

/**
 * Inserts a new entitySet in the database with the transaction builder. Throws
 * a NoResultError and rolls back the transaction if the entitySet couldn't be
 * created.
 *
 * @param trx The transaction builder
 * @param entitySet The new entitySet to add
 * @returns The newly created entitySet
 * @throws NoResultError if the entitySet was unable to be created
 */
export const trxCreateEntitySet = (
  trx: Transaction<Database>,
  entitySet: NewEntitySet
) => {
  return trx
    .insertInto("entitySet")
    .values(convertPropForDb(entitySet, "setName"))
    .executeTakeFirstOrThrow();
};

/**
 * Updates the entitySet with the given `id` and returns the updated entitySet
 * with {@link findEntitySetById}. Returns undefined if the `id` is invalid.
 *
 * @param id The entitySet's `setId`
 * @param updateWith The entitySet fields to update with
 * @returns The updated entitySet or undefined if the given `id` is invalid
 */
export const updateEntitySet = async (
  id: number,
  updateWith: EntitySetUpdate
) => {
  await db
    .updateTable("entitySet")
    .set(convertPropForDb(updateWith, "setName"))
    .where("setId", "=", id)
    .execute();

  return findEntitySetById(updateWith.setId ?? id);
};

/**
 * Deletes the entitySet with the given `id` and returns the deleted entitySet
 * with {@link findEntitySetById}. Returns undefined if the `id` is invalid.
 *
 * @param id The entitySet's `setId`
 * @returns The deleted entitySet or undefined if the given `id` is invalid
 */
export const deleteEntitySet = async (id: number) => {
  const entitySet = await findEntitySetById(id);

  if (entitySet) {
    await db.deleteFrom("entitySet").where("setId", "=", id).execute();
  }

  return entitySet;
};
