import { db } from "@/configs/database.config";

/**
 * Checks if the given user has the given permission based on the user's roles.
 * Returns `perName` if the user has role-based access and undefined otherwise.
 *
 * @param usrId The user's `usrId`
 * @param perName The permission's `perName`
 * @returns A row, or undefined if the user doesn't have the given permission
 */
export const checkRoleBasedAccess = (usrId: number, perName: string) => {
  const query = db
    .selectFrom("userRole")
    .innerJoin("rolePermission", "rlpRolId", "urlRolId")
    .innerJoin("permission", "perId", "rlpPerId")
    .where("urlUsrId", "=", usrId)
    .where("perName", "=", perName);

  return query.select("perName").limit(1).executeTakeFirst();
};
