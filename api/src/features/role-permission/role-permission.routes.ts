import express from "express";
import { checkExact, checkSchema } from "express-validator";

import { handleValidation } from "@/middlewares/validator.middleware";
import { handlers } from "@/utils/routes.util";
import { isValidAuthorization } from "@/utils/validator.util";

import { handleEntitySetAuthorization } from "../auth";
import {
  getRolePermissionByRolId,
  getRolePermissionsByRolIds,
  getRolePermissionByPerId,
  getRolePermissionsByPerIds,
  addRolePermission,
  removeRolePermission,
} from "./role-permission.controller";
import {
  isValidRlpRolId,
  isValidRlpRolIds,
  isValidRlpPerId,
  isValidRlpPerIds,
  isValidAddRolePermission,
} from "./role-permission.validator";

export const rolePermissionRouter = express.Router();

// ------------------------------- GET ------------------------------

rolePermissionRouter.get(
  "/roles/:rlpRolId(\\w+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidRlpRolId),
        checkSchema(isValidAuthorization),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "read"),
    controller: getRolePermissionByRolId,
  })
);

rolePermissionRouter.get(
  "/roles/:rlpRolIds([\\w,]+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidRlpRolIds),
        checkSchema(isValidAuthorization),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "read"),
    controller: getRolePermissionsByRolIds,
  })
);

rolePermissionRouter.get(
  "/permissions/:rlpPerId(\\w+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidRlpPerId),
        checkSchema(isValidAuthorization),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "read"),
    controller: getRolePermissionByPerId,
  })
);

rolePermissionRouter.get(
  "/permissions/:rlpPerIds([\\w,]+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidRlpPerIds),
        checkSchema(isValidAuthorization),
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
      checkExact(checkSchema(isValidAddRolePermission)),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "create"),
    controller: addRolePermission,
  })
);

// ----------------------------- DELETE -----------------------------

rolePermissionRouter.delete(
  "/roles/:rlpRolId/permissions/:rlpPerId",
  handlers({
    validation: [
      checkExact([checkSchema(isValidRlpRolId), checkSchema(isValidRlpPerId)]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("rolePermission", "delete"),
    controller: removeRolePermission,
  })
);
