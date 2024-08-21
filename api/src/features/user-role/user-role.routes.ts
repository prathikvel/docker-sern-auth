import express from "express";
import { checkExact, checkSchema } from "express-validator";

import { handleValidation } from "@/middlewares/validator.middleware";
import { handlers } from "@/utils/routes.util";
import { isValidAuthorization } from "@/utils/validator.util";

import { handleEntitySetAuthorization } from "../auth";
import {
  getUserRoleByUsrId,
  getUserRolesByUsrIds,
  getUserRoleByRolId,
  getUserRolesByRolIds,
  addUserRole,
  removeUserRole,
} from "./user-role.controller";
import {
  isValidUrlUsrId,
  isValidUrlUsrIds,
  isValidUrlRolId,
  isValidUrlRolIds,
  isValidAddUserRole,
} from "./user-role.validator";

export const userRoleRouter = express.Router();

// ------------------------------- GET ------------------------------

userRoleRouter.get(
  "/users/:urlUsrId(\\w+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidUrlUsrId),
        checkSchema(isValidAuthorization),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userRole", "read"),
    controller: getUserRoleByUsrId,
  })
);

userRoleRouter.get(
  "/users/:urlUsrIds([\\w,]+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidUrlUsrIds),
        checkSchema(isValidAuthorization),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userRole", "read"),
    controller: getUserRolesByUsrIds,
  })
);

userRoleRouter.get(
  "/roles/:urlRolId(\\w+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidUrlRolId),
        checkSchema(isValidAuthorization),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userRole", "read"),
    controller: getUserRoleByRolId,
  })
);

userRoleRouter.get(
  "/roles/:urlRolIds([\\w,]+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidUrlRolIds),
        checkSchema(isValidAuthorization),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userRole", "read"),
    controller: getUserRolesByRolIds,
  })
);

// ------------------------------ POST ------------------------------

userRoleRouter.post(
  "/",
  handlers({
    validation: [checkExact(checkSchema(isValidAddUserRole)), handleValidation],
    middleware: handleEntitySetAuthorization("userRole", "create"),
    controller: addUserRole,
  })
);

// ----------------------------- DELETE -----------------------------

userRoleRouter.delete(
  "/users/:urlUsrId/roles/:urlRolId",
  handlers({
    validation: [
      checkExact([checkSchema(isValidUrlUsrId), checkSchema(isValidUrlRolId)]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userRole", "delete"),
    controller: removeUserRole,
  })
);
