import express, { RequestHandler } from "express";
import { checkExact, checkSchema } from "express-validator";

import { handleValidation } from "@/middlewares/validator.middleware";
import { handlers } from "@/utils/routes.util";
import {
  isValidId,
  isValidIds,
  isValidAuthorization,
} from "@/utils/validator.util";

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
import {
  isValidAddUser,
  isValidEditUser,
  isValidEditPassword,
} from "./user.validator";

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
      checkExact(checkSchema(isValidAuthorization)),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("user", "read"),
    controller: getUsers,
  })
);

userRouter.get(
  "/:id(\\w+)",
  handlers({
    validation: [
      checkExact([checkSchema(isValidId), checkSchema(isValidAuthorization)]),
      handleValidation,
    ],
    middleware: handleEntityAuthorization("user", "read"),
    controller: getUserById,
  })
);

userRouter.get(
  "/:ids([\\w,]+)",
  handlers({
    validation: [
      checkExact([checkSchema(isValidIds), checkSchema(isValidAuthorization)]),
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
    validation: [checkExact(checkSchema(isValidAddUser)), handleValidation],
    middleware: handleEntitySetAuthorization("user", "create"),
    controller: addUser,
  })
);

// ------------------------------- PUT ------------------------------

userRouter.put(
  "/:id",
  <RequestHandler>((req, res, next) => {
    const hasOwn = (...props: string[]) => {
      return props.every((v) => Object.hasOwn(req.body, v));
    };
    return hasOwn("curUsrPassword", "newUsrPassword") ? next("route") : next();
  }),

  handlers({
    validation: [
      checkExact([checkSchema(isValidId), checkSchema(isValidEditUser)]),
      handleValidation,
    ],
    middleware: handleEntityAuthorization("user", "update"),
    controller: editUser,
  })
);

userRouter.put(
  "/:id",
  handlers({
    validation: [
      checkExact([checkSchema(isValidId), checkSchema(isValidEditPassword)]),
      handleValidation,
    ],
    middleware: handleEntityAuthorization("user", "update"),
    controller: editUserPassword,
  })
);

// ----------------------------- DELETE -----------------------------

userRouter.delete(
  "/:id",
  handlers({
    validation: [checkExact(checkSchema(isValidId)), handleValidation],
    middleware: handleEntityAuthorization("user", "delete"),
    controller: removeUser,
  })
);
