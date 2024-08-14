import { ExpressionBuilder, sql } from "kysely";

import { db } from "@/configs/database.config";
import { Database } from "@/models";
import {
  ifNull,
  jsonArrayFromExpr,
  jsonObjectFromExpr,
} from "@/utils/database.util";
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

/** The expression that evaluates `perEntity`'s type. */
const entityType = (eb: ExpressionBuilder<Database, keyof Database>) => {
  return ifNull(eb.ref("perEntity"), eb.val("entitySet"), eb.val("entity")).as(
    "entityType"
  );
};

/**
 * Returns an object with the user's entity and entity-set permissions.
 *
 * @param usrId The user's `usrId`
 * @returns An object with the user's entity and entity-set permissions
 */
export const findUserAuthInfo = async (usrId: number) => {
  const query = db
    .selectFrom((eb) => {
      const innerQuery = eb
        .selectFrom((eb) =>
          rolePermissions(eb)
            .where("usrId", "=", usrId)
            .select((eb) => [entityType(eb), "perSet"])
            .union((eb) =>
              userPermissions(eb)
                .where("usrId", "=", usrId)
                .select((eb) => [entityType(eb), "perSet"])
            )
            .as("union")
        )
        .select((eb) => jsonArrayFromExpr(eb.ref("perSet")).as("sets"));

      return innerQuery.select("entityType").groupBy("entityType").as("agg");
    })
    .select((eb) =>
      jsonObjectFromExpr(eb.ref("entityType"), eb.ref("sets")).as("obj")
    );

  return (await query.executeTakeFirstOrThrow()).obj;
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
 * Returns an array of permission types for each entity or entity set the user
 * has access to based on the given entity set and entity/entities.
 *
 * @param usrId The user's `usrId`
 * @param perSet The permission's `perSet`
 * @param perEntity The permission's `perEntity`(s)
 * @returns An array of permission types a user has, given the set and entity(s)
 */
export const findPermissionTypesByEntity = (
  usrId: number,
  perSet: string,
  perEntity: number | null | number[]
) => {
  const filters = { usrId, perSet: convertCamelToSnake(perSet) };
  const perEntityOp = !Array.isArray(perEntity) ? "=" : "in";

  const query = db
    .selectFrom((eb) =>
      rolePermissions(eb)
        .where((eb) => eb.and(filters))
        .where((eb) =>
          eb.or([
            eb("perEntity", "is", null),
            eb("perEntity", perEntityOp, perEntity),
          ])
        )
        .select(["perEntity", "perType"])
        .union((eb) =>
          userPermissions(eb)
            .where((eb) => eb.and(filters))
            .where((eb) =>
              eb.or([
                eb("perEntity", "is", null),
                eb("perEntity", perEntityOp, perEntity),
              ])
            )
            .select(["perEntity", "perType"])
        )
        .as("union")
    )
    .select((eb) => jsonArrayFromExpr(eb.ref("perType")).as("types"));

  return query.select("perEntity").groupBy("perEntity").execute();
};
