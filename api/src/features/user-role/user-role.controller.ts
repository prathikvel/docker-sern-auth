import { RequestHandler } from "express";

import {
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
  includeRepositorySetPerms,
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
  const urlUsrId = Number(req.params.urlUsrId);
  const { permissions } = req.query;
  const hasPermissions = permissions === "true" || permissions === "1";

  findUserRoleByUsrId(urlUsrId)
    .then((data) => {
      if (hasPermissions) {
        const { usrId } = req.user!;
        return includeRepositorySetPerms(usrId, "userRole")(data);
      }
      return data as Record<string, any>;
    })
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with userRoles with the given `urlUsrIds` parameter.
 */
export const getUserRolesByUsrIds: RequestHandler = (req, res, next) => {
  const urlUsrIds = req.params.urlUsrIds.split(",").filter(Boolean).map(Number);
  const { permissions } = req.query;
  const hasPermissions = permissions === "true" || permissions === "1";

  findUserRolesByUsrIds(urlUsrIds)
    .then((data) => {
      if (hasPermissions) {
        const { usrId } = req.user!;
        return includeRepositorySetPerms(usrId, "userRole")(data);
      }
      return data;
    })
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with a userRole with the given `urlRolId` parameter.
 */
export const getUserRoleByRolId: RequestHandler = (req, res, next) => {
  const urlRolId = Number(req.params.urlRolId);
  const { permissions } = req.query;
  const hasPermissions = permissions === "true" || permissions === "1";

  findUserRoleByRolId(urlRolId)
    .then((data) => {
      if (hasPermissions) {
        const { usrId } = req.user!;
        return includeRepositorySetPerms(usrId, "userRole")(data);
      }
      return data as Record<string, any>;
    })
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with userRoles with the given `urlRolIds` parameter.
 */
export const getUserRolesByRolIds: RequestHandler = (req, res, next) => {
  const urlRolIds = req.params.urlRolIds.split(",").filter(Boolean).map(Number);
  const { permissions } = req.query;
  const hasPermissions = permissions === "true" || permissions === "1";

  findUserRolesByRolIds(urlRolIds)
    .then((data) => {
      if (hasPermissions) {
        const { usrId } = req.user!;
        return includeRepositorySetPerms(usrId, "userRole")(data);
      }
      return data;
    })
    .then(respondRepository(res))
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
