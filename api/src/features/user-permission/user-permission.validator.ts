import { Schema } from "express-validator";

import { isValidId, isValidIds } from "@/utils/validator.util";

/** The validation schema for a userPermission's `urpUsrId`. Sanitizes the ID
 * to an integer. */
export const isValidUrpUsrId = { urpUsrId: isValidId.id } satisfies Schema;

/** The validation schema for a userPermission's `urpUsrId`s. Sanitizes the IDs
 * to an array of integers. */
export const isValidUrpUsrIds = { urpUsrIds: isValidIds.ids } satisfies Schema;

/** The validation schema for a userPermission's `urpPerId`. Sanitizes the ID
 * to an integer. */
export const isValidUrpPerId = { urpPerId: isValidId.id } satisfies Schema;

/** The validation schema for a userPermission's `urpPerId`s. Sanitizes the IDs
 * to an array of integers. */
export const isValidUrpPerIds = { urpPerIds: isValidIds.ids } satisfies Schema;

/** The validation schema to add a userPermission. */
export const isValidAddUserPermission = {
  urpUsrId: { ...isValidId.id, in: "body" },
  urpPerId: { ...isValidId.id, in: "body" },
} satisfies Schema;
