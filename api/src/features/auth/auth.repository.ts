import { db } from "@/config/database";

/**
 * Returns the usrId and perName if the given user's role(s) have the given
 * permission. Otherwise, returns undefined.
 *
 * @param usrId The user's `usrId`
 * @param perName The permission's `perName`
 * @returns A row or undefined if the user doesn't have the given permission
 */
export const checkRoleBasedAccess = (usrId: number, perName: string) => {
  const query = db
    .selectFrom("userRole")
    .innerJoin("rolePermission", "rlpRolId", "urlRolId")
    .innerJoin("permission", "perId", "rlpPerId")
    .where("urlUsrId", "=", usrId)
    .where("perName", "=", perName);

  return query.select(["urlUsrId as usrId", "perName"]).executeTakeFirst();
};
