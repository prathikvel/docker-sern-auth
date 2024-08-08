import express from "express";

import { handleEntitiesAuthorization as handleEntitiesAuth } from "../auth";
import {
  getUserPermissionByUsrId,
  getUserPermissionByPerId,
  addUserPermission,
  removeUserPermission,
} from "./user-permission.controller";

export const userPermissionRouter = express.Router();

// get userPermission
userPermissionRouter.get(
  "/users/:urpUsrId",
  handleEntitiesAuth("userPermission", "read", true),
  getUserPermissionByUsrId
);
userPermissionRouter.get(
  "/permissions/:urpPerId",
  handleEntitiesAuth("userPermission", "read", true),
  getUserPermissionByPerId
);

// add userPermission
userPermissionRouter.post(
  "/",
  handleEntitiesAuth("userPermission", "create", true),
  addUserPermission
);

// remove userPermission
userPermissionRouter.delete(
  "/users/:urpUsrId/permissions/:urpPerId",
  handleEntitiesAuth("userPermission", "delete", true),
  removeUserPermission
);
