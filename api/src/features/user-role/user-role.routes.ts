import express from "express";
import { checkExact, param, body } from "express-validator";

import { USER_ROLE } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import { handlers } from "@/utils/routes.util";

import { handleEntitySetAuthorization } from "../auth";
import {
  getUserRoleByUsrId,
  getUserRolesByUsrIds,
  getUserRoleByRolId,
  getUserRolesByRolIds,
  addUserRole,
  removeUserRole,
} from "./user-role.controller";

export const userRoleRouter = express.Router();

// ------------------------------- GET ------------------------------

userRoleRouter.get(
  "/users/:urlUsrId(\\d+)",
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
  "/users/:urlUsrIds([\\d,]+)",
  handlers({
    validation: [
      checkExact(
        param("urlUsrIds", USER_ROLE.ERRORS.URL_USR_ID).custom(
          (value: string) => {
            return value.split(",").every((v) => v && !isNaN(Number(v)));
          }
        )
      ),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userRole", "read"),
    controller: getUserRolesByUsrIds,
  })
);

userRoleRouter.get(
  "/roles/:urlRolId(\\d+)",
  handlers({
    validation: [
      checkExact(param("urlRolId", USER_ROLE.ERRORS.URL_ROL_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userRole", "read"),
    controller: getUserRoleByRolId,
  })
);

userRoleRouter.get(
  "/roles/:urlRolIds([\\d,]+)",
  handlers({
    validation: [
      checkExact(
        param("urlRolIds", USER_ROLE.ERRORS.URL_ROL_ID).custom(
          (value: string) => {
            return value.split(",").every((v) => v && !isNaN(Number(v)));
          }
        )
      ),
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
  "/users/:urlUsrId(\\d+)/roles/:urlRolId(\\d+)",
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
