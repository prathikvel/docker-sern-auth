import express from "express";
import { checkExact, param, body } from "express-validator";

import { ROLE } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import { handlers } from "@/utils/routes.util";

import { handleEntitySetAuthorization } from "../auth";
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
    middleware: handleEntitySetAuthorization("role", "read"),
    controller: getRoles,
  })
);

roleRouter.get(
  "/:id(\d+)", // prettier-ignore
  handlers({
    validation: [
      checkExact(param("id", ROLE.ERRORS.ROL_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("role", "read"),
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
    middleware: handleEntitySetAuthorization("role", "create"),
    controller: addRole,
  })
);

// ------------------------------- PUT ------------------------------

roleRouter.put(
  "/:id(\d+)", // prettier-ignore
  handlers({
    validation: [
      checkExact([
        param("id", ROLE.ERRORS.ROL_ID).isInt(),
        body("rolName", ROLE.ERRORS.ROL_NAME).isAlpha().optional(),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("role", "update"),
    controller: editRole,
  })
);

// ----------------------------- DELETE -----------------------------

roleRouter.delete(
  "/:id(\d+)", // prettier-ignore
  handlers({
    validation: [
      checkExact(param("id", ROLE.ERRORS.ROL_ID).isInt()),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("role", "delete"),
    controller: removeRole,
  })
);
