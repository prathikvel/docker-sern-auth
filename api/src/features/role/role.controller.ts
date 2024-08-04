import { RequestHandler } from "express";
import { checkExact, param, body } from "express-validator";

import { ROLE, ERRORS } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import {
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
} from "@/utils/controller.util";
import { ServerError } from "@/utils/error.util";

import { createPermissible, deletePermissible } from "../permissible";
import {
  findRoleById,
  findRoles,
  findRolesByIds,
  createRole,
  updateRole,
  deleteRole,
} from "./role.repository";

/**
 * Responds with all system roles.
 */
export const getRoles: RequestHandler = (req, res, next) => {
  const { authInfo } = res.locals;
  if (authInfo) {
    if (authInfo.allEntities) {
      findRoles()
        .then(respondRepository(res))
        .catch(handleRepositoryError(next));
    } else {
      findRolesByIds(authInfo.entities)
        .then(respondRepository(res))
        .catch(handleRepositoryError(next));
    }
  } else {
    next(new ServerError(500, ERRORS[500]));
  }
};

/**
 * Responds with a role with the given `id` parameter.
 */
export const getRoleById: RequestHandler[] = [
  // validation
  checkExact(param("id", ROLE.ERRORS.ROL_ID).isInt()),
  handleValidation,

  // controller
  (req, res, next) => {
    const id = Number(req.params.id);
    findRoleById(id)
      .then(respondRepositoryOrThrow(res))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Creates a new role with properties from `req.body` and responds with the
 * newly created role.
 */
export const addRole: RequestHandler[] = [
  // validation
  checkExact(body("rolName", ROLE.ERRORS.ROL_NAME).isAlpha()),
  handleValidation,

  // controller
  async (req, res, next) => {
    const { pblId: rolId } = await createPermissible();
    createRole({ rolId, ...req.body })
      .then(respondRepository(res, { status: 201 }))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Edits a role with the given `id` parameter and properties from `req.body`.
 * Responds with the edited role.
 */
export const editRole: RequestHandler[] = [
  // validation
  checkExact([
    param("id", ROLE.ERRORS.ROL_ID).isInt(),
    body("rolName", ROLE.ERRORS.ROL_NAME).isAlpha().optional(),
  ]),
  handleValidation,

  // controller
  (req, res, next) => {
    const id = Number(req.params.id);
    updateRole(id, req.body)
      .then(respondRepositoryOrThrow(res))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Deletes a role with the given `id` parameter and responds with the deleted
 * role.
 */
export const removeRole: RequestHandler[] = [
  // validation
  checkExact(param("id", ROLE.ERRORS.ROL_ID).isInt()),
  handleValidation,

  // controller
  (req, res, next) => {
    const id = Number(req.params.id);
    deleteRole(id)
      .then(respondRepositoryOrThrow(res))
      .then(() => deletePermissible(id))
      .catch(handleRepositoryError(next));
  },
];
