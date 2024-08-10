import express from "express";
import { checkExact, param, body } from "express-validator";

import { USER_PERMISSION } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import { handlers } from "@/utils/routes.util";

import { handleEntitySetAuthorization } from "../auth";
import {
  getUserPermissionByUsrId,
  getUserPermissionsByUsrIds,
  getUserPermissionByPerId,
  getUserPermissionsByPerIds,
  addUserPermission,
  removeUserPermission,
} from "./user-permission.controller";

export const userPermissionRouter = express.Router();

// ------------------------------- GET ------------------------------

userPermissionRouter.get(
  "/users/:urpUsrId(\\d+)",
  handlers({
    validation: [
      checkExact(param("urpUsrId", USER_PERMISSION.ERRORS.URP_USR_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userPermission", "read"),
    controller: getUserPermissionByUsrId,
  })
);

userPermissionRouter.get(
  "/users/:urpUsrIds([\\d,]+)",
  handlers({
    validation: [
      checkExact(
        param("urpUsrIds", USER_PERMISSION.ERRORS.URP_USR_ID).custom(
          (value: string) => {
            return value.split(",").every((v) => v && !isNaN(Number(v)));
          }
        )
      ),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userPermission", "read"),
    controller: getUserPermissionsByUsrIds,
  })
);

userPermissionRouter.get(
  "/permissions/:urpPerId(\\d+)",
  handlers({
    validation: [
      checkExact(param("urpPerId", USER_PERMISSION.ERRORS.URP_PER_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userPermission", "read"),
    controller: getUserPermissionByPerId,
  })
);

userPermissionRouter.get(
  "/permissions/:urpPerIds([\\d,]+)",
  handlers({
    validation: [
      checkExact(
        param("urpPerIds", USER_PERMISSION.ERRORS.URP_PER_ID).custom(
          (value: string) => {
            return value.split(",").every((v) => v && !isNaN(Number(v)));
          }
        )
      ),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userPermission", "read"),
    controller: getUserPermissionsByPerIds,
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
    middleware: handleEntitySetAuthorization("userPermission", "create"),
    controller: addUserPermission,
  })
);

// ----------------------------- DELETE -----------------------------

userPermissionRouter.delete(
  "/users/:urpUsrId(\\d+)/permissions/:urpPerId(\\d+)",
  handlers({
    validation: [
      checkExact([
        param("urpUsrId", USER_PERMISSION.ERRORS.URP_USR_ID).isInt(),
        param("urpPerId", USER_PERMISSION.ERRORS.URP_PER_ID).isInt(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userPermission", "delete"),
    controller: removeUserPermission,
  })
);
