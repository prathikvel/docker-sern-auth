import { Schema } from "express-validator";

import { ROLE } from "@/configs/global.config";

/** The validation schema to add a role. */
export const isValidAddRole = {
  rolName: {
    errorMessage: ROLE.ERRORS.ROL_NAME,
    isAlphanumeric: true,
    in: "body",
  },
} satisfies Schema;

/** The validation schema to edit a role. */
export const isValidEditRole = {
  rolName: { ...isValidAddRole.rolName, optional: true },
} satisfies Schema;

/** The validation schema to filter roles. */
export const isValidFilterRoles = {
  rolName: { ...isValidAddRole.rolName, optional: true, in: "params" },
} satisfies Schema;
