import express from "express";
import { checkExact, param, body } from "express-validator";

import { USER_ROLE } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import { handlers } from "@/utils/routes.util";

import { handleEntitySetAuthorization } from "../auth";
import {
  getUserRoleByUsrId,
  getUserRoleByRolId,
  addUserRole,
  removeUserRole,
} from "./user-role.controller";

export const userRoleRouter = express.Router();

// ------------------------------- GET ------------------------------

userRoleRouter.get(
  "/users/:urlUsrId(\d+)", // prettier-ignore
  handlers({
    validation: [
      checkExact(param("urlUsrId", USER_ROLE.ERRORS.URL_USR_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userRole", "read"),
    controller: getUserRoleByUsrId,
  })
);

userRoleRouter.get(
  "/roles/:urlRolId(\d+)", // prettier-ignore
  handlers({
    validation: [
      checkExact(param("urlRolId", USER_ROLE.ERRORS.URL_ROL_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userRole", "read"),
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
    middleware: handleEntitySetAuthorization("userRole", "create"),
    controller: addUserRole,
  })
);

// ----------------------------- DELETE -----------------------------

userRoleRouter.delete(
  "/users/:urlUsrId(\d+)/roles/:urlRolId(\d+)", // prettier-ignore
  handlers({
    validation: [
      checkExact([
        param("urlUsrId", USER_ROLE.ERRORS.URL_USR_ID).isInt(),
        param("urlRolId", USER_ROLE.ERRORS.URL_ROL_ID).isInt(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userRole", "delete"),
    controller: removeUserRole,
  })
);
