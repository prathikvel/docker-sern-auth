import express from "express";
import { checkExact, param, body } from "express-validator";

import { ROLE } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import { handlers } from "@/utils/routes.util";

import { handleEntitiesAuthorization } from "../auth";
import {
  getRoleById,
  getRoles,
  addRole,
  editRole,
  removeRole,
} from "./role.controller";

export const roleRouter = express.Router();

// ------------------------------- GET ------------------------------

roleRouter.get(
  "/",
  handlers({
    middleware: handleEntitiesAuthorization("role", "read", true),
    controller: getRoles,
  })
);

roleRouter.get(
  "/:id",
  handlers({
    validation: [
      checkExact(param("id", ROLE.ERRORS.ROL_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("role", "read", true),
    controller: getRoleById,
  })
);

// ------------------------------ POST ------------------------------

roleRouter.post(
  "/",
  handlers({
    validation: [
      checkExact(body("rolName", ROLE.ERRORS.ROL_NAME).isAlpha()),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("role", "create", true),
    controller: addRole,
  })
);

// ------------------------------- PUT ------------------------------

roleRouter.put(
  "/:id",
  handlers({
    validation: [
      checkExact([
        param("id", ROLE.ERRORS.ROL_ID).isInt(),
        body("rolName", ROLE.ERRORS.ROL_NAME).isAlpha().optional(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("role", "update", true),
    controller: editRole,
  })
);

// ----------------------------- DELETE -----------------------------

roleRouter.delete(
  "/:id",
  handlers({
    validation: [
      checkExact(param("id", ROLE.ERRORS.ROL_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitiesAuthorization("role", "delete", true),
    controller: removeRole,
  })
);
