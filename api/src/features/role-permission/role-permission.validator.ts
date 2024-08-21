import { Schema } from "express-validator";

import { isValidId, isValidIds } from "@/utils/validator.util";

/** The validation schema for a rolePermission's `rlpRolId`. Sanitizes the ID
 * to an integer. */
export const isValidRlpRolId = { rlpRolId: isValidId.id } satisfies Schema;

/** The validation schema for a rolePermission's `rlpRolId`s. Sanitizes the IDs
 * to an array of integers. */
export const isValidRlpRolIds = { rlpRolIds: isValidIds.ids } satisfies Schema;

/** The validation schema for a rolePermission's `rlpPerId`. Sanitizes the ID
 * to an integer. */
export const isValidRlpPerId = { rlpPerId: isValidId.id } satisfies Schema;

/** The validation schema for a rolePermission's `rlpPerId`s. Sanitizes the IDs
 * to an array of integers. */
export const isValidRlpPerIds = { rlpPerIds: isValidIds.ids } satisfies Schema;

/** The validation schema to add a rolePermission. */
export const isValidAddRolePermission = {
  rlpRolId: { ...isValidId.id, in: "body" },
  rlpPerId: { ...isValidId.id, in: "body" },
} satisfies Schema;
