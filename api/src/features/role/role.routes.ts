import express from "express";

import { handleEntitiesAuthorization as handleEntitiesAuth } from "../auth";
import {
  getRoleById,
  getRoles,
  addRole,
  editRole,
  removeRole,
} from "./role.controller";

export const roleRouter = express.Router();

// get role
roleRouter.get("/:id", handleEntitiesAuth("role", "read", true), getRoleById);
roleRouter.get("/", handleEntitiesAuth("role", "read", true), getRoles);

// add role
roleRouter.post("/", handleEntitiesAuth("role", "create", true), addRole);

// edit role
roleRouter.put("/:id", handleEntitiesAuth("role", "update", true), editRole);

// remove role
roleRouter.delete(
  "/:id",
  handleEntitiesAuth("role", "delete", true),
  removeRole
);
