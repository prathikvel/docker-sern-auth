import express, { RequestHandler } from "express";
import { checkExact, param, query, body } from "express-validator";

import { AUTH, USER } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validator.middleware";
import { handlers } from "@/utils/routes.util";

import {
  handleEntityAuthorization,
  handleEntitiesAuthorization,
  handleEntitySetAuthorization,
} from "../auth";
import {
  getCurrentUser,
  getUsers,
  getUserById,
  getUsersByIds,
  addUser,
  editUser,
  editUserPassword,
  removeUser,
} from "./user.controller";

export const userRouter = express.Router();

// ------------------------------- GET ------------------------------

userRouter.get(
  "/current",
  handlers({
    controller: getCurrentUser,
  })
);

userRouter.get(
  "/",
  handlers({
    validation: [
      checkExact(query("permissions").isBoolean().optional()),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("user", "read"),
    controller: getUsers,
  })
);

userRouter.get(
  "/:id(\\d+)",
  handlers({
    validation: [
      checkExact([
        param("id", USER.ERRORS.USR_ID).isInt(),
        query("permissions").isBoolean().optional(),
      ]),
      handleValidation,
    ],
    middleware: handleEntityAuthorization("user", "read"),
    controller: getUserById,
  })
);

userRouter.get(
  "/:ids([\\d,]+)",
  handlers({
    validation: [
      checkExact([
        param("ids", USER.ERRORS.USR_ID).custom((value: string) => {
          return value.split(",").every((v) => v && !isNaN(Number(v)));
        }),
        query("permissions").isBoolean().optional(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("user", "read"),
    controller: getUsersByIds,
  })
);

// ------------------------------ POST ------------------------------

userRouter.post(
  "/",
  handlers({
    validation: [
      checkExact([
        body("usrName", USER.ERRORS.USR_NAME).isAlpha(),
        body("usrEmail", USER.ERRORS.USR_EMAIL).isEmail(),
        body("usrPassword", USER.ERRORS.USR_PASSWORD).isLength({
          min: AUTH.PWD_MIN_LENGTH,
        }),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("user", "create"),
    controller: addUser,
  })
);

// ------------------------------- PUT ------------------------------

userRouter.put(
  "/:id(\\d+)",
  <RequestHandler>((req, res, next) => {
    const hasOwn = (...props: string[]) => {
      return props.every((v) => Object.hasOwn(req.body, v));
    };
    return hasOwn("oldUsrPassword", "newUsrPassword") ? next("route") : next();
  }),

  handlers({
    validation: [
      checkExact([
        param("id", USER.ERRORS.USR_ID).isInt(),
        body("usrName", USER.ERRORS.USR_NAME).isAlpha().optional(),
        body("usrEmail", USER.ERRORS.USR_EMAIL).isEmail().optional(),
      ]),
      handleValidation,
    ],
    middleware: handleEntityAuthorization("user", "update"),
    controller: editUser,
  })
);

userRouter.put(
  "/:id(\\d+)",
  handlers({
    validation: [
      checkExact([
        param("id", USER.ERRORS.USR_ID).isInt(),
        body("oldUsrPassword", USER.ERRORS.OLD_USR_PASSWORD).notEmpty(),
        body("newUsrPassword", USER.ERRORS.NEW_USR_PASSWORD).isLength({
          min: AUTH.PWD_MIN_LENGTH,
        }),
      ]),
      handleValidation,
    ],
    middleware: handleEntityAuthorization("user", "update"),
    controller: editUserPassword,
  })
);

// ----------------------------- DELETE -----------------------------

userRouter.delete(
  "/:id(\\d+)",
  handlers({
    validation: [
      checkExact(param("id", USER.ERRORS.USR_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntityAuthorization("user", "delete"),
    controller: removeUser,
  })
);
