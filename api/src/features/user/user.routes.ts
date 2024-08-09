import express, { RequestHandler } from "express";
import { checkExact, param, body } from "express-validator";

import { AUTH, USER } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import { handlers } from "@/utils/routes.util";

import {
  handleEntityAuthorization,
  handleEntitiesAuthorization,
} from "../auth";
import {
  getCurrentUser,
  getUserById,
  getUsers,
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
    middleware: handleEntitiesAuthorization("user", "read"),
    controller: getUsers,
  })
);

userRouter.get(
  "/:id(\d+)", // prettier-ignore
  handlers({
    validation: [
      checkExact(param("id", USER.ERRORS.USR_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntityAuthorization("user", "read"),
    controller: getUserById,
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
    middleware: handleEntitiesAuthorization("user", "create", true),
    controller: addUser,
  })
);

// ------------------------------- PUT ------------------------------

userRouter.put(
  "/:id(\d+)", // prettier-ignore
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
  "/:id(\d+)", // prettier-ignore
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
  "/:id(\d+)", // prettier-ignore
  handlers({
    validation: [
      checkExact(param("id", USER.ERRORS.USR_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntityAuthorization("user", "delete"),
    controller: removeUser,
  })
);
