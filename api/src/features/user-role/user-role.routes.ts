import express from "express";

import { handleEntitiesAuthorization as handleEntitiesAuth } from "../auth";
import {
  getUserRolesByUsrId,
  getUserRolesByRolId,
  addUserRole,
  removeUserRole,
} from "./user-role.controller";

export const userRouter = express.Router();

// get user
userRouter.get(
  "/users/:urlUsrId",
  handleEntitiesAuth("userRole", "read", true),
  getUserRolesByUsrId
);
userRouter.get(
  "/roles/:urlRolId",
  handleEntitiesAuth("userRole", "read", true),
  getUserRolesByRolId
);

// add user
userRouter.post(
  "/",
  handleEntitiesAuth("userRole", "create", true),
  addUserRole
);

// remove user
userRouter.delete(
  "/users/:urlUsrId/roles/:urlRolId",
  handleEntitiesAuth("userRole", "delete", true),
  removeUserRole
);
