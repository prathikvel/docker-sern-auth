import { sql } from "kysely";

import { db } from "@/configs/database.config";

/**
 * Checks if the given user has the given permission based on the user's roles.
 * Returns true if the user has role-based access and false otherwise.
 *
 * @param usrId The user's `usrId`
 * @param perName The permission's `perName`
 * @param perPblId The permission's `perPblId`
 * @returns A boolean representing the user's role-based access to the permission
 */
export const checkRoleBasedAccess = async (
  usrId: number,
  perName: string,
  perPblId: number | null
) => {
  const query = db.selectNoFrom((eb) =>
    eb
      .exists(
        eb
          .selectFrom("user")
          .innerJoin("userRole", "urlUsrId", "usrId")
          .innerJoin("rolePermission", "rlpRolId", "urlRolId")
          .innerJoin("permission", "perId", "rlpPerId")
          .where("usrId", "=", usrId)
          .where("perName", "=", perName)
          .where((eb) =>
            eb.or([eb("perPblId", "is", null), eb("perPblId", "=", perPblId)])
          )
          .select(sql`1` as any)
      )
      .as("exists")
  );

  return (await query.executeTakeFirstOrThrow()).exists;
};

/**
 * Checks if the given user has the given permission based on user's individual
 * permissions. Returns true if user has user-based access and false otherwise.
 *
 * @param usrId The user's `usrId`
 * @param perName The permission's `perName`
 * @param perPblId The permission's `perPblId`
 * @returns A boolean representing the user's user-based access to the permission
 */
export const checkUserBasedAccess = async (
  usrId: number,
  perName: string,
  perPblId: number | null
) => {
  const query = db.selectNoFrom((eb) =>
    eb
      .exists(
        eb
          .selectFrom("user")
          .innerJoin("userPermission", "urpUsrId", "usrId")
          .innerJoin("permission", "perId", "urpPerId")
          .where("usrId", "=", usrId)
          .where("perName", "=", perName)
          .where((eb) =>
            eb.or([eb("perPblId", "is", null), eb("perPblId", "=", perPblId)])
          )
          .select(sql`1` as any)
      )
      .as("exists")
  );

  return (await query.executeTakeFirstOrThrow()).exists;
};
