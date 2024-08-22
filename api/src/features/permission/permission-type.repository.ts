import { Transaction } from "kysely";

import { db } from "@/configs/database.config";
import { Database } from "@/models";
import { pick } from "@/utils/object.util";

import {
  PermissionType,
  NewPermissionType,
  PermissionTypeUpdate,
} from "./permission-type.model";

/** The columns to filter, including all permissionType columns. */
const columns = ["prtId", "prtName"] as const;

/**
 * The generic function to find a permissionType based on a criterion.
 *
 * @param criterion The column name
 * @param criterionValue The value of the criterion
 * @returns The permissionType or undefined if the `criterionValue` is invalid
 */
const findPermissionType = <K extends keyof PermissionType>(
  criterion: K,
  criterionValue: PermissionType[K]
) => {
  const query = db
    .selectFrom("permissionType")
    .where(criterion, "=", criterionValue as any);

  return query.selectAll().executeTakeFirst();
};

/**
 * Returns the permissionType or undefined if the given `id` is invalid.
 *
 * @param id The permissionType's `prtId`
 * @returns The permissionType or undefined if the given `id` is invalid
 */
export const findPermissionTypeById = (id: number) =>
  findPermissionType("prtId", id);

/**
 * Returns the permissionType or undefined if the given `name` is invalid.
 *
 * @param name The permissionType's `prtName`
 * @returns The permissionType or undefined if the given `name` is invalid
 */
export const findPermissionTypeByName = (name: string) =>
  findPermissionType("prtName", name);

/**
 * Returns an array of permissionTypes that match the given criteria. Returns
 * all permissionTypes if no criteria are provided. All the criteria will be
 * compared via equality.
 *
 * @param criteria An object of permissionType to match with
 * @returns An array of permissionTypes that match given criteria
 */
export const findPermissionTypes = (criteria: Partial<PermissionType> = {}) => {
  const query = db
    .selectFrom("permissionType")
    .where((eb) => eb.and(pick(criteria, columns)));

  return query.selectAll().execute();
};

/**
 * Inserts a new permissionType in the database and returns the newly created
 * permissionType with {@link findPermissionTypeById}. Throws a NoResultError
 * if the permissionType couldn't be created.
 *
 * @param permissionType The new permissionType to add
 * @returns The newly created permissionType
 * @throws NoResultError if the permissionType was unable to be created
 */
export const createPermissionType = async (
  permissionType: NewPermissionType
) => {
  const { insertId } = await db
    .insertInto("permissionType")
    .values(permissionType)
    .executeTakeFirstOrThrow();

  return findPermissionTypeById(Number(insertId!));
};

/**
 * Inserts a new permissionType in the database with the transaction builder.
 * Throws a NoResultError and rolls back the transaction if the permissionType
 * couldn't be created.
 *
 * @param trx The transaction builder
 * @param permissionType The new permissionType to add
 * @returns The newly created permissionType
 * @throws NoResultError if the permissionType was unable to be created
 */
export const trxCreatePermissionType = (
  trx: Transaction<Database>,
  permissionType: NewPermissionType
) => {
  return trx
    .insertInto("permissionType")
    .values(permissionType)
    .executeTakeFirstOrThrow();
};

/**
 * Updates the permissionType with the given `id` and returns the updated
 * permissionType with {@link findPermissionTypeById}. Returns undefined if the
 * `id` is invalid.
 *
 * @param id The permissionType's `prtId`
 * @param updateWith The permissionType fields to update with
 * @returns The updated permissionType or undefined if the given `id` is invalid
 */
export const updatePermissionType = async (
  id: number,
  updateWith: PermissionTypeUpdate
) => {
  await db
    .updateTable("permissionType")
    .set(updateWith)
    .where("prtId", "=", id)
    .execute();

  return findPermissionTypeById(updateWith.prtId ?? id);
};

/**
 * Deletes the permissionType with the given `id` and returns the deleted
 * permissionType with {@link findPermissionTypeById}. Returns undefined if the
 * `id` is invalid.
 *
 * @param id The permissionType's `prtId`
 * @returns The deleted permissionType or undefined if the given `id` is invalid
 */
export const deletePermissionType = async (id: number) => {
  const permissionType = await findPermissionTypeById(id);

  if (permissionType) {
    await db.deleteFrom("permissionType").where("prtId", "=", id).execute();
  }

  return permissionType;
};
