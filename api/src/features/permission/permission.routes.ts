import express from "express";
import { checkExact, param, query } from "express-validator";

import { PERMISSION } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validator.middleware";
import { handlers } from "@/utils/routes.util";

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
    validation: [
      checkExact(query("permissions").isBoolean().optional()),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("permission", "read"),
    controller: getPermissions,
  })
);

permissionRouter.get(
  "/:id(\\d+)",
  handlers({
    validation: [
      checkExact([
        param("id", PERMISSION.ERRORS.PER_ID).isInt(),
        query("permissions").isBoolean().optional(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("permission", "read"),
    controller: getPermissionById,
  })
);

permissionRouter.get(
  "/:ids([\\d,]+)",
  handlers({
    validation: [
      checkExact([
        param("ids", PERMISSION.ERRORS.PER_ID).custom((value: string) => {
          return value.split(",").every((v) => v && !isNaN(Number(v)));
        }),
        query("permissions").isBoolean().optional(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("permission", "read"),
    controller: getPermissionsByIds,
  })
);
