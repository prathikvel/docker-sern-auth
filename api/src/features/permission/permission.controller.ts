import { RequestHandler } from "express";

import {
  transformToResponse,
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
  includeRepositorySetAuth,
} from "@/utils/controller.util";

import {
  findPermissionById,
  findPermissions,
  findPermissionsByIds,
} from "./permission.repository";

/**
 * Responds with all system permissions.
 */
export const getPermissions: RequestHandler = (req, res, next) => {
  findPermissions()
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "permission"))
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with a permission with the given `id` parameter.
 */
export const getPermissionById: RequestHandler = (req, res, next) => {
  const id = Number(req.params.id);
  findPermissionById(id)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "permission"))
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with permissions with the given `ids` parameter.
 */
export const getPermissionsByIds: RequestHandler = (req, res, next) => {
  const ids = req.params.ids.split(",").filter(Boolean).map(Number);
  findPermissionsByIds(ids)
    .then(transformToResponse)
    .then(includeRepositorySetAuth(req, "permission"))
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};
