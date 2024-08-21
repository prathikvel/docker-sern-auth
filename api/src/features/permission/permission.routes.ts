import express from "express";
import { checkExact, checkSchema } from "express-validator";

import { handleValidation } from "@/middlewares/validator.middleware";
import { handlers } from "@/utils/routes.util";
import {
  isValidId,
  isValidIds,
  isValidPermissions,
} from "@/utils/validator.util";

import { handleEntitySetAuthorization } from "../auth";
import {
  getPermissions,
  getPermissionById,
  getPermissionsByIds,
} from "./permission.controller";

export const permissionRouter = express.Router();

// ------------------------------- GET ------------------------------

permissionRouter.get(
  "/",
  handlers({
    validation: [checkExact(checkSchema(isValidPermissions)), handleValidation],
    middleware: handleEntitySetAuthorization("permission", "read"),
    controller: getPermissions,
  })
);

permissionRouter.get(
  "/:id(\\w+)",
  handlers({
    validation: [
      checkExact([checkSchema(isValidId), checkSchema(isValidPermissions)]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("permission", "read"),
    controller: getPermissionById,
  })
);

permissionRouter.get(
  "/:ids([\\w,]+)",
  handlers({
    validation: [
      checkExact([checkSchema(isValidIds), checkSchema(isValidPermissions)]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("permission", "read"),
    controller: getPermissionsByIds,
  })
);
