import express from "express";

import { handleEntitiesAuthorization as handleEntitiesAuth } from "../auth";
import {
  getUserRoleByUsrId,
  getUserRoleByRolId,
  addUserRole,
  removeUserRole,
} from "./user-role.controller";

export const userRoleRouter = express.Router();

// get userRole
userRoleRouter.get(
  "/users/:urlUsrId",
  handleEntitiesAuth("userRole", "read", true),
  getUserRoleByUsrId
);
userRoleRouter.get(
  "/roles/:urlRolId",
  handleEntitiesAuth("userRole", "read", true),
  getUserRoleByRolId
);

// add userRole
userRoleRouter.post(
  "/",
  handleEntitiesAuth("userRole", "create", true),
  addUserRole
);

// remove userRole
userRoleRouter.delete(
  "/users/:urlUsrId/roles/:urlRolId",
  handleEntitiesAuth("userRole", "delete", true),
  removeUserRole
);
