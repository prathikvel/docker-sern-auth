import express from "express";
import { checkExact, param, body } from "express-validator";

import { ROLE_PERMISSION } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import { handlers } from "@/utils/routes.util";

import { handleEntitySetAuthorization } from "../auth";
import {
  getRolePermissionByRolId,
  getRolePermissionByPerId,
  addRolePermission,
  removeRolePermission,
} from "./role-permission.controller";

export const rolePermissionRouter = express.Router();

// ------------------------------- GET ------------------------------

rolePermissionRouter.get(
  "/roles/:rlpRolId(\d+)", // prettier-ignore
  handlers({
    validation: [
      checkExact(param("rlpRolId", ROLE_PERMISSION.ERRORS.RLP_ROL_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "read"),
    controller: getRolePermissionByRolId,
  })
);

rolePermissionRouter.get(
  "/permissions/:rlpPerId(\d+)", // prettier-ignore
  handlers({
    validation: [
      checkExact(param("rlpPerId", ROLE_PERMISSION.ERRORS.RLP_PER_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "read"),
    controller: getRolePermissionByPerId,
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
  "/roles/:rlpRolId(\d+)/permissions/:rlpPerId(\d+)", // prettier-ignore
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
