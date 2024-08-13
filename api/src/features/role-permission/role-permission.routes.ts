import express from "express";
import { checkExact, param, query, body } from "express-validator";

import { ROLE_PERMISSION } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import { handlers } from "@/utils/routes.util";

import { handleEntitySetAuthorization } from "../auth";
import {
  getRolePermissionByRolId,
  getRolePermissionsByRolIds,
  getRolePermissionByPerId,
  getRolePermissionsByPerIds,
  addRolePermission,
  removeRolePermission,
} from "./role-permission.controller";

export const rolePermissionRouter = express.Router();

// ------------------------------- GET ------------------------------

rolePermissionRouter.get(
  "/roles/:rlpRolId(\\d+)",
  handlers({
    validation: [
      checkExact([
        param("rlpRolId", ROLE_PERMISSION.ERRORS.RLP_ROL_ID).isInt(),
        query("permissions").isBoolean().optional(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "read"),
    controller: getRolePermissionByRolId,
  })
);

rolePermissionRouter.get(
  "/roles/:rlpRolIds([\\d,]+)",
  handlers({
    validation: [
      checkExact([
        param("rlpRolIds", ROLE_PERMISSION.ERRORS.RLP_ROL_ID).custom(
          (value: string) => {
            return value.split(",").every((v) => v && !isNaN(Number(v)));
          }
        ),
        query("permissions").isBoolean().optional(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "read"),
    controller: getRolePermissionsByRolIds,
  })
);

rolePermissionRouter.get(
  "/permissions/:rlpPerId(\\d+)",
  handlers({
    validation: [
      checkExact([
        param("rlpPerId", ROLE_PERMISSION.ERRORS.RLP_PER_ID).isInt(),
        query("permissions").isBoolean().optional(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "read"),
    controller: getRolePermissionByPerId,
  })
);

rolePermissionRouter.get(
  "/permissions/:rlpPerIds([\\d,]+)",
  handlers({
    validation: [
      checkExact([
        param("rlpPerIds", ROLE_PERMISSION.ERRORS.RLP_PER_ID).custom(
          (value: string) => {
            return value.split(",").every((v) => v && !isNaN(Number(v)));
          }
        ),
        query("permissions").isBoolean().optional(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "read"),
    controller: getRolePermissionsByPerIds,
  })
);

// ------------------------------ POST ------------------------------

rolePermissionRouter.post(
  "/",
  handlers({
    validation: [
      checkExact([
        body("rlpRolId", ROLE_PERMISSION.ERRORS.RLP_ROL_ID).isInt(),
        body("rlpPerId", ROLE_PERMISSION.ERRORS.RLP_PER_ID).isInt(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "create"),
    controller: addRolePermission,
  })
);

// ----------------------------- DELETE -----------------------------

rolePermissionRouter.delete(
  "/roles/:rlpRolId(\\d+)/permissions/:rlpPerId(\\d+)",
  handlers({
    validation: [
      checkExact([
        param("rlpRolId", ROLE_PERMISSION.ERRORS.RLP_ROL_ID).isInt(),
        param("rlpPerId", ROLE_PERMISSION.ERRORS.RLP_PER_ID).isInt(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "delete"),
    controller: removeRolePermission,
  })
);
