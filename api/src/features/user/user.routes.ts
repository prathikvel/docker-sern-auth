import express, { RequestHandler } from "express";

import {
  handleEntityAuthorization as handleEntityAuth,
  handleEntitiesAuthorization as handleEntitiesAuth,
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

// get user
userRouter.get("/current", getCurrentUser);
userRouter.get("/:id", handleEntityAuth("user", "read"), getUserById);
userRouter.get("/", handleEntitiesAuth("user", "read"), getUsers);

// add user
userRouter.post("/", handleEntitiesAuth("user", "create", true), addUser);

// edit user
userRouter.put(
  "/:id",
  handleEntityAuth("user", "update"),
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
userRouter.delete("/:id", handleEntityAuth("user", "delete"), removeUser);
