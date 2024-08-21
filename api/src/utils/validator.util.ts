import { Schema } from "express-validator";

import { ERRORS } from "@/configs/global.config";

/** The validation schema for an entity's ID. Sanitizes the ID to an integer. */
export const isValidId = {
  id: {
    errorMessage: ERRORS.ID,
    isInt: true,
    toInt: true,
    in: "params",
  },
} satisfies Schema;

/** The validation schema for an entity's IDs. Sanitizes the IDs to an array of
 * integers. */
export const isValidIds = {
  ids: {
    errorMessage: ERRORS.IDS,
    custom: {
      options: (val: string) => val.split(",").every((v) => /^\d+$/.test(v)),
    },
    customSanitizer: {
      options: (val: string) => val.split(",").map((v) => parseInt(v, 10)),
    },
    in: "params",
  },
} satisfies Schema;

/** The validation schema for whether to include the user's authorization for an
 * entity. Sanitizes the parameter to a boolean. */
export const isValidAuthorization = {
  authorization: {
    errorMessage: ERRORS.AUTHORIZATION,
    isBoolean: true,
    toBoolean: true,
    optional: true,
    in: "query",
  },
} satisfies Schema;
