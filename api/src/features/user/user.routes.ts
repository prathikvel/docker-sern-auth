import express from "express";

import { authorizationHandler } from "../auth";
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
  authorizationHandler("user:read", checkUserBasedAccess),
  getUserById
);
userRouter.get("/", authorizationHandler("user:read"), getUsers);

// add user
userRouter.post("/", authorizationHandler("user:create"), addUser);

// edit user
userRouter.put(
  "/:id",
  authorizationHandler("user:update", checkUserBasedAccess),
  (req, res, next) => {
    const hasOwn = (...props: string[]) => {
      return props.every((v) => Object.hasOwn(req.body, v));
    };
    return hasOwn("oldUsrPassword", "newUsrPassword") ? next("route") : next();
  },
  editUser
);
userRouter.put("/:id", editUserPassword);

// remove user
userRouter.delete(
  "/:id",
  authorizationHandler("user:delete", checkUserBasedAccess),
  removeUser
);
