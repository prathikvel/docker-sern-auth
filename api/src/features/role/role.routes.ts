import express from "express";

import {
  handleEntityAuthorization as handleEntityAuth,
  handleEntitiesAuthorization as handleEntitiesAuth,
} from "../auth";
import {
  getRoleById,
  getRoles,
  addRole,
  editRole,
  removeRole,
} from "./role.controller";

export const roleRouter = express.Router();

// get role
roleRouter.get("/:id", handleEntityAuth("role", "read"), getRoleById);
roleRouter.get("/", handleEntitiesAuth("role", "read"), getRoles);

// add role
roleRouter.post("/", handleEntitiesAuth("role", "create", true), addRole);

// edit role
roleRouter.put("/:id", handleEntityAuth("role", "update"), editRole);

// remove role
roleRouter.delete("/:id", handleEntityAuth("role", "delete"), removeRole);
