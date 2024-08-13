import { RequestHandler } from "express";

import {
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
  includeRepositorySetPerms,
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
  const rlpRolId = Number(req.params.rlpRolId);
  const { permissions } = req.query;
  const hasPermissions = permissions === "true" || permissions === "1";

  findRolePermissionByRolId(rlpRolId)
    .then((data) => {
      if (hasPermissions) {
        const { usrId } = req.user!;
        return includeRepositorySetPerms(usrId, "rolePermission")(data);
      }
      return data as Record<string, any>;
    })
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with rolePermissions with the given `rlpRolIds` parameter.
 */
export const getRolePermissionsByRolIds: RequestHandler = (req, res, next) => {
  const rlpRolIds = req.params.rlpRolIds.split(",").filter(Boolean).map(Number);
  const { permissions } = req.query;
  const hasPermissions = permissions === "true" || permissions === "1";

  findRolePermissionsByRolIds(rlpRolIds)
    .then((data) => {
      if (hasPermissions) {
        const { usrId } = req.user!;
        return includeRepositorySetPerms(usrId, "rolePermission")(data);
      }
      return data;
    })
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with a rolePermission with the given `rlpPerId` parameter.
 */
export const getRolePermissionByPerId: RequestHandler = (req, res, next) => {
  const rlpPerId = Number(req.params.rlpPerId);
  const { permissions } = req.query;
  const hasPermissions = permissions === "true" || permissions === "1";

  findRolePermissionByPerId(rlpPerId)
    .then((data) => {
      if (hasPermissions) {
        const { usrId } = req.user!;
        return includeRepositorySetPerms(usrId, "rolePermission")(data);
      }
      return data as Record<string, any>;
    })
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with rolePermissions with the given `rlpPerIds` parameter.
 */
export const getRolePermissionsByPerIds: RequestHandler = (req, res, next) => {
  const rlpPerIds = req.params.rlpPerIds.split(",").filter(Boolean).map(Number);
  const { permissions } = req.query;
  const hasPermissions = permissions === "true" || permissions === "1";

  findRolePermissionsByPerIds(rlpPerIds)
    .then((data) => {
      if (hasPermissions) {
        const { usrId } = req.user!;
        return includeRepositorySetPerms(usrId, "rolePermission")(data);
      }
      return data;
    })
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Creates a new rolePermission with properties from `req.body` and responds
 * with the newly created rolePermission.
 */
export const addRolePermission: RequestHandler = (req, res, next) => {
  createRolePermission(req.body)
    .then(respondRepository(res, { status: 201 }))
    .catch(handleRepositoryError(next));
};

/**
 * Deletes a rolePermission with the given `id` parameters and responds with
 * the deleted rolePermission.
 */
export const removeRolePermission: RequestHandler = (req, res, next) => {
  const { rlpRolId, rlpPerId } = req.params;
  deleteRolePermission(Number(rlpRolId), Number(rlpPerId))
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};
