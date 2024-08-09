import express from "express";
import { checkExact, param, body } from "express-validator";

import { USER_PERMISSION } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import { handlers } from "@/utils/routes.util";

import { handleEntitiesAuthorization } from "../auth";
import {
  getUserPermissionByUsrId,
  getUserPermissionByPerId,
  addUserPermission,
  removeUserPermission,
} from "./user-permission.controller";

export const userPermissionRouter = express.Router();

// ------------------------------- GET ------------------------------

userPermissionRouter.get(
  "/users/:urpUsrId",
  handlers({
    validation: [
      checkExact(param("urpUsrId", USER_PERMISSION.ERRORS.URP_USR_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("userPermission", "read", true),
    controller: getUserPermissionByUsrId,
  })
);

userPermissionRouter.get(
  "/permissions/:urpPerId",
  handlers({
    validation: [
      checkExact(param("urpPerId", USER_PERMISSION.ERRORS.URP_PER_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("userPermission", "read", true),
    controller: getUserPermissionByPerId,
  })
);

// ------------------------------ POST ------------------------------

userPermissionRouter.post(
  "/",
  handlers({
    validation: [
      checkExact([
        body("urpUsrId", USER_PERMISSION.ERRORS.URP_USR_ID).isInt(),
        body("urpPerId", USER_PERMISSION.ERRORS.URP_PER_ID).isInt(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("userPermission", "create", true),
    controller: addUserPermission,
  })
);

// ----------------------------- DELETE -----------------------------

userPermissionRouter.delete(
  "/users/:urpUsrId/permissions/:urpPerId",
  handlers({
    validation: [
      checkExact([
        param("urpUsrId", USER_PERMISSION.ERRORS.URP_USR_ID).isInt(),
        param("urpPerId", USER_PERMISSION.ERRORS.URP_PER_ID).isInt(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("userPermission", "delete", true),
    controller: removeUserPermission,
  })
);
