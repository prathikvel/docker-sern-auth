import { ExpressionBuilder, sql } from "kysely";

import { db } from "@/configs/database.config";
import { Database } from "@/models";
import { jsonArrayFromExpr } from "@/utils/database.util";

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
  const filters = { usrId, perSet, perType };

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
  const filters = { usrId, perSet, perType };

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
