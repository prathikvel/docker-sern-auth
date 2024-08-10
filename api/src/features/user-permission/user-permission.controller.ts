import { RequestHandler } from "express";

import {
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
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
  const urpUsrId = Number(req.params.urpUsrId);
  findUserPermissionByUsrId(urpUsrId)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with userPermissions with the given `urpUsrIds` parameter.
 */
export const getUserPermissionsByUsrIds: RequestHandler = (req, res, next) => {
  const urpUsrIds = req.params.urpUsrIds.split(",").filter(Boolean).map(Number);
  findUserPermissionsByUsrIds(urpUsrIds)
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with a userPermission with the given `urpPerId` parameter.
 */
export const getUserPermissionByPerId: RequestHandler = (req, res, next) => {
  const urpPerId = Number(req.params.urpPerId);
  findUserPermissionByPerId(urpPerId)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with userPermissions with the given `urpPerIds` parameter.
 */
export const getUserPermissionsByPerIds: RequestHandler = (req, res, next) => {
  const urpPerIds = req.params.urpPerIds.split(",").filter(Boolean).map(Number);
  findUserPermissionsByPerIds(urpPerIds)
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Creates a new userPermission with properties from `req.body` and responds
 * with the newly created userPermission.
 */
export const addUserPermission: RequestHandler = (req, res, next) => {
  createUserPermission(req.body)
    .then(respondRepository(res, { status: 201 }))
    .catch(handleRepositoryError(next));
};

/**
 * Deletes a userPermission with the given `id` parameters and responds with
 * the deleted userPermission.
 */
export const removeUserPermission: RequestHandler = (req, res, next) => {
  const { urpUsrId, urpPerId } = req.params;
  deleteUserPermission(Number(urpUsrId), Number(urpPerId))
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};
