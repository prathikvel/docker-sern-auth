import { Schema } from "express-validator";

import { isValidId, isValidIds } from "@/utils/validator.util";

/** The validation schema for a userRole's `urlUsrId`. Sanitizes the ID to an
 * integer. */
export const isValidUrlUsrId = { urlUsrId: isValidId.id } satisfies Schema;

/** The validation schema for a userRole's `urlUsrId`s. Sanitizes the IDs to an
 * array of integers. */
export const isValidUrlUsrIds = { urlUsrIds: isValidIds.ids } satisfies Schema;

/** The validation schema for a userRole's `urlRolId`. Sanitizes the ID to an
 * integer. */
export const isValidUrlRolId = { urlRolId: isValidId.id } satisfies Schema;

/** The validation schema for a userRole's `urlRolId`s. Sanitizes the IDs to an
 * array of integers. */
export const isValidUrlRolIds = { urlRolIds: isValidIds.ids } satisfies Schema;

/** The validation schema to add a userRole. */
export const isValidAddUserRole = {
  urlUsrId: { ...isValidId.id, in: "body" },
  urlRolId: { ...isValidId.id, in: "body" },
} satisfies Schema;
