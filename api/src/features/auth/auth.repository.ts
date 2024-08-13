import { ExpressionBuilder, sql } from "kysely";

import { db } from "@/configs/database.config";
import { Database } from "@/models";
import { jsonArrayFromExpr } from "@/utils/database.util";
import { convertCamelToSnake } from "@/utils/string.util";

/** The select query for role-based permissions. */
const rolePermissions = (eb: ExpressionBuilder<Database, keyof Database>) => {
  return eb
    .selectFrom("user")
    .innerJoin("userRole", "urlUsrId", "usrId")
    .innerJoin("rolePermission", "rlpRolId", "urlRolId")
    .innerJoin("permission", "perId", "rlpPerId");
};

/** The select query for user-based permissions. */
const userPermissions = (eb: ExpressionBuilder<Database, keyof Database>) => {
  return eb
    .selectFrom("user")
    .innerJoin("userPermission", "urpUsrId", "usrId")
    .innerJoin("permission", "perId", "urpPerId");
};

/**
 * Checks if the given user has the given permission based on user's role and
 * individual permissions. Returns true if user has access and false otherwise.
 *
 * @param usrId The user's `usrId`
 * @param perSet The permission's `perSet`
 * @param perType The permission's `perType`
 * @param perEntity The permission's `perEntity`
 * @returns A boolean representing the given user's access to the given entity
 */
export const checkEntityAccess = async (
  usrId: number,
  perSet: string,
  perType: string,
  perEntity: number | null
) => {
  const filters = { usrId, perSet: convertCamelToSnake(perSet), perType };

  const query = db.selectNoFrom((eb) =>
    eb
      .or([
        eb.exists(
          rolePermissions(eb)
            .where((eb) => eb.and(filters))
            .where((eb) =>
              eb.or([
                eb("perEntity", "is", null),
                eb("perEntity", "=", perEntity),
              ])
            )
            .select(sql`1` as any)
        ),
        eb.exists(
          userPermissions(eb)
            .where((eb) => eb.and(filters))
            .where((eb) =>
              eb.or([
                eb("perEntity", "is", null),
                eb("perEntity", "=", perEntity),
              ])
            )
            .select(sql`1` as any)
        ),
      ])
      .as("exists")
  );

  return (await query.executeTakeFirstOrThrow()).exists;
};

/**
 * Checks if the given user has the permission for all the given entities based
 * on user's role and individual permissions. Returns true if user has access to
 * all the given entities and false otherwise.
 *
 * @param usrId The user's `usrId`
 * @param perSet The permission's `perSet`
 * @param perType The permission's `perType`
 * @param perEntities The permission's `perEntity`s
 * @returns A boolean representing the given user's access to the given entities
 */
export const checkEntitiesAccess = async (
  usrId: number,
  perSet: string,
  perType: string,
  perEntities: number[]
) => {
  const filters = { usrId, perSet: convertCamelToSnake(perSet), perType };

  const query = db
    .selectFrom((eb) =>
      rolePermissions(eb)
        .where((eb) => eb.and(filters))
        .where("perEntity", "in", perEntities)
        .select("perEntity")
        .union((eb) =>
          userPermissions(eb)
            .where((eb) => eb.and(filters))
            .where("perEntity", "in", perEntities)
            .select("perEntity")
        )
        .as("union")
    )
    .select((eb) => eb.fn.countAll<number>().as("count"));

  return perEntities.length === (await query.executeTakeFirstOrThrow()).count;
};

/**
 * Returns an array of entities the user has access to based on the given entity
 * set and permission type.
 *
 * @param usrId The user's `usrId`
 * @param perSet The permission's `perSet`
 * @param perType The permission's `perType`
 * @returns An array of entities the user has access to, given the set and type
 */
export const findAccessibleEntities = async (
  usrId: number,
  perSet: string,
  perType: string
) => {
  const filters = { usrId, perSet: convertCamelToSnake(perSet), perType };

  const query = db
    .selectFrom((eb) =>
      rolePermissions(eb)
        .where((eb) => eb.and(filters))
        .select("perEntity")
        .union((eb) =>
          userPermissions(eb)
            .where((eb) => eb.and(filters))
            .select("perEntity")
        )
        .as("union")
    )
    .select((eb) => jsonArrayFromExpr(eb.ref("perEntity")).as("entities"));

  return (await query.executeTakeFirstOrThrow()).entities;
};

/**
 * Returns an array of permission types the user has access to based on the
 * given entity set and entity.
 *
 * @param usrId The user's `usrId`
 * @param perSet The permission's `perSet`
 * @param perEntity The permission's `perEntity`
 * @returns An array of permission types a user has, given the set and entity
 */
export const findPermissionTypesByEntity = async (
  usrId: number,
  perSet: string,
  perEntity: number | null
) => {
  const filters = { usrId, perSet: convertCamelToSnake(perSet) };

  const query = db
    .selectFrom((eb) =>
      rolePermissions(eb)
        .where((eb) => eb.and(filters))
        .where((eb) =>
          eb.or([
            // prettier-ignore
            eb("perEntity", "is", null),
            eb("perEntity", "=", perEntity),
          ])
        )
        .select("perType")
        .union((eb) =>
          userPermissions(eb)
            .where((eb) => eb.and(filters))
            .where((eb) =>
              eb.or([
                eb("perEntity", "is", null),
                eb("perEntity", "=", perEntity),
              ])
            )
            .select("perType")
        )
        .as("union")
    )
    .select((eb) => jsonArrayFromExpr(eb.ref("perType")).as("types"));

  return (await query.executeTakeFirstOrThrow()).types;
};

/**
 * Returns an array of permission types for each entity the user has access to
 * based on the given entity set and entities.
 *
 * @param usrId The user's `usrId`
 * @param perSet The permission's `perSet`
 * @param perEntities The permission's `perEntity`s
 * @returns An array of permission types a user has, given the set and entities
 */
export const findPermissionTypesByEntities = (
  usrId: number,
  perSet: string,
  perEntities: number[]
) => {
  const filters = { usrId, perSet: convertCamelToSnake(perSet) };

  const query = db
    .selectFrom((eb) =>
      rolePermissions(eb)
        .where((eb) => eb.and(filters))
        .where((eb) =>
          eb.or([
            eb("perEntity", "is", null),
            eb("perEntity", "in", perEntities),
          ])
        )
        .select(["perEntity", "perType"])
        .union((eb) =>
          userPermissions(eb)
            .where((eb) => eb.and(filters))
            .where((eb) =>
              eb.or([
                eb("perEntity", "is", null),
                eb("perEntity", "in", perEntities),
              ])
            )
            .select(["perEntity", "perType"])
        )
        .as("union")
    )
    .select((eb) => jsonArrayFromExpr(eb.ref("perType")).as("types"));

  return query.select("perEntity").groupBy("perEntity").execute();
};
