import { RequestHandler } from "express";

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
export const getUserRoleByUsrId: RequestHandler = (req, res, next) => {
  const urlUsrId = Number(req.params.urlUsrId);
  findUserRoleByUsrId(urlUsrId)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with a userRole with the given `urlRolId` parameter.
 */
export const getUserRoleByRolId: RequestHandler = (req, res, next) => {
  const urlRolId = Number(req.params.urlRolId);
  findUserRoleByRolId(urlRolId)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Creates a new userRole with properties from `req.body` and responds with
 * the newly created userRole.
 */
export const addUserRole: RequestHandler = (req, res, next) => {
  createUserRole(req.body)
    .then(respondRepository(res, { status: 201 }))
    .catch(handleRepositoryError(next));
};

/**
 * Deletes a userRole with the given `id` parameters and responds with the
 * deleted userRole.
 */
export const removeUserRole: RequestHandler = (req, res, next) => {
  const { urlUsrId, urlRolId } = req.params;
  deleteUserRole(Number(urlUsrId), Number(urlRolId))
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};
