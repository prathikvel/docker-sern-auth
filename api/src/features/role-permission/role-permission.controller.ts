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
  findRolePermissionByRolId,
  findRolePermissionByPerId,
  findRolePermissionsByRolIds,
  findRolePermissionsByPerIds,
  createRolePermission,
  deleteRolePermission,
} from "./role-permission.repository";

/**
 * Responds with a rolePermission with the given `rlpRolId` parameter.
 */
export const getRolePermissionByRolId: RequestHandler = (req, res, next) => {
  const { rlpRolId } = matchedData(req, { locations: ["params"] });
  findRolePermissionByRolId(rlpRolId)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "rolePermission"))
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with rolePermissions with the given `rlpRolIds` parameter.
 */
export const getRolePermissionsByRolIds: RequestHandler = (req, res, next) => {
  const { rlpRolIds } = matchedData(req, { locations: ["params"] });
  findRolePermissionsByRolIds(rlpRolIds)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "rolePermission"))
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with a rolePermission with the given `rlpPerId` parameter.
 */
export const getRolePermissionByPerId: RequestHandler = (req, res, next) => {
  const { rlpPerId } = matchedData(req, { locations: ["params"] });
  findRolePermissionByPerId(rlpPerId)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "rolePermission"))
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with rolePermissions with the given `rlpPerIds` parameter.
 */
export const getRolePermissionsByPerIds: RequestHandler = (req, res, next) => {
  const { rlpPerIds } = matchedData(req, { locations: ["params"] });
  findRolePermissionsByPerIds(rlpPerIds)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "rolePermission"))
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Creates a new rolePermission with properties from `req.body` and responds
 * with the newly created rolePermission.
 */
export const addRolePermission: RequestHandler = (req, res, next) => {
  createRolePermission(req.body)
    .then(transformToResponse)
    .then(respondRepository(res, { status: 201 }))
    .catch(handleRepositoryError(next));
};

/**
 * Deletes a rolePermission with the given `id` parameters and responds with
 * the deleted rolePermission.
 */
export const removeRolePermission: RequestHandler = (req, res, next) => {
  const { rlpRolId, rlpPerId } = matchedData(req, { locations: ["params"] });
  deleteRolePermission(rlpRolId, rlpPerId)
    .then(transformToResponse)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};
