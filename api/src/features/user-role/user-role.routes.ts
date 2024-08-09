import express from "express";
import { checkExact, param, body } from "express-validator";

import { USER_ROLE } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import { handlers } from "@/utils/routes.util";

import { handleEntitiesAuthorization } from "../auth";
import {
  getUserRoleByUsrId,
  getUserRoleByRolId,
  addUserRole,
  removeUserRole,
} from "./user-role.controller";

export const userRoleRouter = express.Router();

// ------------------------------- GET ------------------------------

userRoleRouter.get(
  "/users/:urlUsrId",
  handlers({
    validation: [
      checkExact(param("urlUsrId", USER_ROLE.ERRORS.URL_USR_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("userRole", "read", true),
    controller: getUserRoleByUsrId,
  })
);

userRoleRouter.get(
  "/roles/:urlRolId",
  handlers({
    validation: [
      checkExact(param("urlRolId", USER_ROLE.ERRORS.URL_ROL_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("userRole", "read", true),
    controller: getUserRoleByRolId,
  })
);

// ------------------------------ POST ------------------------------

userRoleRouter.post(
  "/",
  handlers({
    validation: [
      checkExact([
        body("urlUsrId", USER_ROLE.ERRORS.URL_USR_ID).isInt(),
        body("urlRolId", USER_ROLE.ERRORS.URL_ROL_ID).isInt(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("userRole", "create", true),
    controller: addUserRole,
  })
);

// ----------------------------- DELETE -----------------------------

userRoleRouter.delete(
  "/users/:urlUsrId/roles/:urlRolId",
  handlers({
    validation: [
      checkExact([
        param("urlUsrId", USER_ROLE.ERRORS.URL_USR_ID).isInt(),
        param("urlRolId", USER_ROLE.ERRORS.URL_ROL_ID).isInt(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("userRole", "delete", true),
    controller: removeUserRole,
  })
);
