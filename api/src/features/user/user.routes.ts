import express, { RequestHandler } from "express";

import { handleAuthorization } from "../auth";
import {
  getCurrentUser,
  getUserById,
  getUsers,
  addUser,
  editUser,
  editUserPassword,
  removeUser,
} from "./user.controller";
import { checkUserBasedAccess } from "./user.repository";

export const userRouter = express.Router();

// get user
userRouter.get("/current", getCurrentUser);
userRouter.get(
  "/:id",
  handleAuthorization("user:read", checkUserBasedAccess),
  getUserById
);
userRouter.get("/", handleAuthorization("user:read"), getUsers);

// add user
userRouter.post("/", handleAuthorization("user:create"), addUser);

// edit user
userRouter.put(
  "/:id",
  handleAuthorization("user:update", checkUserBasedAccess),
  <RequestHandler>((req, res, next) => {
    const hasOwn = (...props: string[]) => {
      return props.every((v) => Object.hasOwn(req.body, v));
    };
    return hasOwn("oldUsrPassword", "newUsrPassword") ? next("route") : next();
  }),
  editUser
);
userRouter.put("/:id", editUserPassword);

// remove user
userRouter.delete(
  "/:id",
  handleAuthorization("user:delete", checkUserBasedAccess),
  removeUser
);
