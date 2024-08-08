import express from "express";

import { handleEntitiesAuthorization as handleEntitiesAuth } from "../auth";
import {
  getRolePermissionByRolId,
  getRolePermissionByPerId,
  addRolePermission,
  removeRolePermission,
} from "./role-permission.controller";

export const rolePermissionRouter = express.Router();

// get rolePermission
rolePermissionRouter.get(
  "/roles/:rlpRolId",
  handleEntitiesAuth("rolePermission", "read", true),
  getRolePermissionByRolId
);
rolePermissionRouter.get(
  "/permissions/:rlpPerId",
  handleEntitiesAuth("rolePermission", "read", true),
  getRolePermissionByPerId
);

// add rolePermission
rolePermissionRouter.post(
  "/",
  handleEntitiesAuth("rolePermission", "create", true),
  addRolePermission
);

// remove rolePermission
rolePermissionRouter.delete(
  "/roles/:rlpRolId/permissions/:rlpPerId",
  handleEntitiesAuth("rolePermission", "delete", true),
  removeRolePermission
);
