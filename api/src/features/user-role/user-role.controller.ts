import { RequestHandler } from "express";
import { matchedData } from "express-validator";

import {
  transformToResponse,
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
  includeRepositorySetAuth,
} from "@/utils/controller.util";

import {
  findUserRoleByUsrId,
  findUserRoleByRolId,
  findUserRolesByUsrIds,
  findUserRolesByRolIds,
  createUserRole,
  deleteUserRole,
} from "./user-role.repository";

/**
 * Responds with a userRole with the given `urlUsrId` parameter.
 */
export const getUserRoleByUsrId: RequestHandler = (req, res, next) => {
  const { urlUsrId } = matchedData(req, { locations: ["params"] });
  findUserRoleByUsrId(urlUsrId)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "userRole"))
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with userRoles with the given `urlUsrIds` parameter.
 */
export const getUserRolesByUsrIds: RequestHandler = (req, res, next) => {
  const { urlUsrIds } = matchedData(req, { locations: ["params"] });
  findUserRolesByUsrIds(urlUsrIds)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "userRole"))
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with a userRole with the given `urlRolId` parameter.
 */
export const getUserRoleByRolId: RequestHandler = (req, res, next) => {
  const { urlRolId } = matchedData(req, { locations: ["params"] });
  findUserRoleByRolId(urlRolId)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "userRole"))
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with userRoles with the given `urlRolIds` parameter.
 */
export const getUserRolesByRolIds: RequestHandler = (req, res, next) => {
  const { urlRolIds } = matchedData(req, { locations: ["params"] });
  findUserRolesByRolIds(urlRolIds)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "userRole"))
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Creates a new userRole with properties from `req.body` and responds with
 * the newly created userRole.
 */
export const addUserRole: RequestHandler = (req, res, next) => {
  createUserRole(req.body)
    .then(transformToResponse)
    .then(respondRepository(res, { status: 201 }))
    .catch(handleRepositoryError(next));
};

/**
 * Deletes a userRole with the given `id` parameters and responds with the
 * deleted userRole.
 */
export const removeUserRole: RequestHandler = (req, res, next) => {
  const { urlUsrId, urlRolId } = matchedData(req, { locations: ["params"] });
  deleteUserRole(urlUsrId, urlRolId)
    .then(transformToResponse)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};
