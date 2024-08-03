import { sql } from "kysely";

import { db } from "@/configs/database.config";

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
  const query = db.selectNoFrom((eb) =>
    eb
      .exists(
        eb
          .selectFrom("user")
          .innerJoin("userRole", "urlUsrId", "usrId")
          .innerJoin("userPermission", "urpUsrId", "usrId")
          .innerJoin("rolePermission", "rlpRolId", "urlRolId")
          .innerJoin("permission", "perId", "rlpPerId")
          .innerJoin("permission", "perId", "urpPerId")
          .where("usrId", "=", usrId)
          .where("perSet", "=", perSet)
          .where("perType", "=", perType)
          .where((eb) =>
            eb.or([
              eb("perEntity", "is", null),
              eb("perEntity", "=", perEntity),
            ])
          )
          .select(sql`1` as any)
      )
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
  const query = db
    .selectFrom("user")
    .innerJoin("userRole", "urlUsrId", "usrId")
    .innerJoin("userPermission", "urpUsrId", "usrId")
    .innerJoin("rolePermission", "rlpRolId", "urlRolId")
    .innerJoin("permission", "perId", "rlpPerId")
    .innerJoin("permission", "perId", "urpPerId")
    .where("usrId", "=", usrId)
    .where("perSet", "=", perSet)
    .where("perType", "=", perType);

  return (await query.select("perEntity").execute()).map((v) => v.perEntity);
};
