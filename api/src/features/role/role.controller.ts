import { RequestHandler } from "express";

import {
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
} from "@/utils/controller.util";

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
  findRoles().then(respondRepository(res)).catch(handleRepositoryError(next));
};

/**
 * Responds with a role with the given `id` parameter.
 */
export const getRoleById: RequestHandler = (req, res, next) => {
  const id = Number(req.params.id);
  findRoleById(id)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with roles with the given `ids` parameter.
 */
export const getRolesByIds: RequestHandler = (req, res, next) => {
  const ids = req.params.ids.split(",").filter(Boolean).map(Number);
  findRolesByIds(ids)
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Creates a new role with properties from `req.body` and responds with the
 * newly created role.
 */
export const addRole: RequestHandler = (req, res, next) => {
  createRole(req.body)
    .then(respondRepository(res, { status: 201 }))
    .catch(handleRepositoryError(next));
};

/**
 * Edits a role with the given `id` parameter and properties from `req.body`.
 * Responds with the edited role.
 */
export const editRole: RequestHandler = (req, res, next) => {
  const id = Number(req.params.id);
  updateRole(id, req.body)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Deletes a role with the given `id` parameter and responds with the deleted
 * role.
 */
export const removeRole: RequestHandler = (req, res, next) => {
  const id = Number(req.params.id);
  deleteRole(id)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};
