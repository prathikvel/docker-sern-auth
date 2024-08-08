import { RequestHandler } from "express";
import { checkExact, param, body } from "express-validator";

import { USER_ROLE } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import {
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
} from "@/utils/controller.util";

import {
  findUserRoleByUsrId,
  findUserRoleByRolId,
  createUserRole,
  deleteUserRole,
} from "./user-role.repository";

/**
 * Responds with a userRole with the given `urlUsrId` parameter.
 */
export const getUserRoleByUsrId: RequestHandler[] = [
  // validation
  checkExact(param("urlUsrId", USER_ROLE.ERRORS.URL_USR_ID).isInt()),
  handleValidation,

  // controller
  (req, res, next) => {
    const urlUsrId = Number(req.params.urlUsrId);
    findUserRoleByUsrId(urlUsrId)
      .then(respondRepositoryOrThrow(res))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Responds with a userRole with the given `urlRolId` parameter.
 */
export const getUserRoleByRolId: RequestHandler[] = [
  // validation
  checkExact(param("urlRolId", USER_ROLE.ERRORS.URL_ROL_ID).isInt()),
  handleValidation,

  // controller
  (req, res, next) => {
    const urlRolId = Number(req.params.urlRolId);
    findUserRoleByRolId(urlRolId)
      .then(respondRepositoryOrThrow(res))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Creates a new userRole with properties from `req.body` and responds with
 * the newly created userRole.
 */
export const addUserRole: RequestHandler[] = [
  // validation
  checkExact([
    body("urlUsrId", USER_ROLE.ERRORS.URL_USR_ID).isInt(),
    body("urlRolId", USER_ROLE.ERRORS.URL_ROL_ID).isInt(),
  ]),
  handleValidation,

  // controller
  (req, res, next) => {
    createUserRole(req.body)
      .then(respondRepository(res, { status: 201 }))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Deletes a userRole with the given `id` parameters and responds with the
 * deleted role.
 */
export const removeUserRole: RequestHandler[] = [
  // validation
  checkExact([
    param("urlUsrId", USER_ROLE.ERRORS.URL_USR_ID).isInt(),
    param("urlRolId", USER_ROLE.ERRORS.URL_ROL_ID).isInt(),
  ]),
  handleValidation,

  // controller
  (req, res, next) => {
    const { urlUsrId, urlRolId } = req.params;
    deleteUserRole(Number(urlUsrId), Number(urlRolId))
      .then(respondRepositoryOrThrow(res))
      .catch(handleRepositoryError(next));
  },
];
