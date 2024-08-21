import express from "express";
import { checkExact, checkSchema } from "express-validator";

import { handleValidation } from "@/middlewares/validator.middleware";
import { handlers } from "@/utils/routes.util";
import {
  isValidId,
  isValidIds,
  isValidPermissions,
} from "@/utils/validator.util";

import { handleEntitySetAuthorization } from "../auth";
import {
  getRoles,
  getRoleById,
  getRolesByIds,
  addRole,
  editRole,
  removeRole,
} from "./role.controller";
import { isValidAddRole, isValidEditRole } from "./role.validator";

export const roleRouter = express.Router();

// ------------------------------- GET ------------------------------

roleRouter.get(
  "/",
  handlers({
    validation: [checkExact(checkSchema(isValidPermissions)), handleValidation],
    middleware: handleEntitySetAuthorization("role", "read"),
    controller: getRoles,
  })
);

roleRouter.get(
  "/:id(\\w+)",
  handlers({
    validation: [
      checkExact([checkSchema(isValidId), checkSchema(isValidPermissions)]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("role", "read"),
    controller: getRoleById,
  })
);

roleRouter.get(
  "/:ids([\\w,]+)",
  handlers({
    validation: [
      checkExact([checkSchema(isValidIds), checkSchema(isValidPermissions)]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("role", "read"),
    controller: getRolesByIds,
  })
);

// ------------------------------ POST ------------------------------

roleRouter.post(
  "/",
  handlers({
    validation: [checkExact(checkSchema(isValidAddRole)), handleValidation],
    middleware: handleEntitySetAuthorization("role", "create"),
    controller: addRole,
  })
);

// ------------------------------- PUT ------------------------------

roleRouter.put(
  "/:id",
  handlers({
    validation: [
      checkExact([checkSchema(isValidId), checkSchema(isValidEditRole)]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("role", "update"),
    controller: editRole,
  })
);

// ----------------------------- DELETE -----------------------------

roleRouter.delete(
  "/:id",
  handlers({
    validation: [checkExact(checkSchema(isValidId)), handleValidation],
    middleware: handleEntitySetAuthorization("role", "delete"),
    controller: removeRole,
  })
);
