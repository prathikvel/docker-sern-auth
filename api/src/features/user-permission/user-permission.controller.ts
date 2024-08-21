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
  findUserPermissionByUsrId,
  findUserPermissionByPerId,
  findUserPermissionsByUsrIds,
  findUserPermissionsByPerIds,
  createUserPermission,
  deleteUserPermission,
} from "./user-permission.repository";

/**
 * Responds with a userPermission with the given `urpUsrId` parameter.
 */
export const getUserPermissionByUsrId: RequestHandler = (req, res, next) => {
  const { urpUsrId } = matchedData(req, { locations: ["params"] });
  findUserPermissionByUsrId(urpUsrId)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "userPermission"))
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with userPermissions with the given `urpUsrIds` parameter.
 */
export const getUserPermissionsByUsrIds: RequestHandler = (req, res, next) => {
  const { urpUsrIds } = matchedData(req, { locations: ["params"] });
  findUserPermissionsByUsrIds(urpUsrIds)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "userPermission"))
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with a userPermission with the given `urpPerId` parameter.
 */
export const getUserPermissionByPerId: RequestHandler = (req, res, next) => {
  const { urpPerId } = matchedData(req, { locations: ["params"] });
  findUserPermissionByPerId(urpPerId)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "userPermission"))
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with userPermissions with the given `urpPerIds` parameter.
 */
export const getUserPermissionsByPerIds: RequestHandler = (req, res, next) => {
  const { urpPerIds } = matchedData(req, { locations: ["params"] });
  findUserPermissionsByPerIds(urpPerIds)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "userPermission"))
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Creates a new userPermission with properties from `req.body` and responds
 * with the newly created userPermission.
 */
export const addUserPermission: RequestHandler = (req, res, next) => {
  createUserPermission(req.body)
    .then(transformToResponse)
    .then(respondRepository(res, { status: 201 }))
    .catch(handleRepositoryError(next));
};

/**
 * Deletes a userPermission with the given `id` parameters and responds with
 * the deleted userPermission.
 */
export const removeUserPermission: RequestHandler = (req, res, next) => {
  const { urpUsrId, urpPerId } = matchedData(req, { locations: ["params"] });
  deleteUserPermission(urpUsrId, urpPerId)
    .then(transformToResponse)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};
