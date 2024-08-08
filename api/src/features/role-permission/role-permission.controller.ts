import { RequestHandler } from "express";
import { checkExact, param, body } from "express-validator";

import { ROLE_PERMISSION } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import {
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
} from "@/utils/controller.util";

import {
  findRolePermissionByRolId,
  findRolePermissionByPerId,
  createRolePermission,
  deleteRolePermission,
} from "./role-permission.repository";

/**
 * Responds with a rolePermission with the given `rlpRolId` parameter.
 */
export const getRolePermissionByRolId: RequestHandler[] = [
  // validation
  checkExact(param("rlpRolId", ROLE_PERMISSION.ERRORS.RLP_ROL_ID).isInt()),
  handleValidation,

  // controller
  (req, res, next) => {
    const rlpRolId = Number(req.params.rlpRolId);
    findRolePermissionByRolId(rlpRolId)
      .then(respondRepositoryOrThrow(res))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Responds with a rolePermission with the given `rlpPerId` parameter.
 */
export const getRolePermissionByPerId: RequestHandler[] = [
  // validation
  checkExact(param("rlpPerId", ROLE_PERMISSION.ERRORS.RLP_PER_ID).isInt()),
  handleValidation,

  // controller
  (req, res, next) => {
    const rlpPerId = Number(req.params.rlpPerId);
    findRolePermissionByPerId(rlpPerId)
      .then(respondRepositoryOrThrow(res))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Creates a new rolePermission with properties from `req.body` and responds
 * with the newly created rolePermission.
 */
export const addRolePermission: RequestHandler[] = [
  // validation
  checkExact([
    body("rlpRolId", ROLE_PERMISSION.ERRORS.RLP_ROL_ID).isInt(),
    body("rlpPerId", ROLE_PERMISSION.ERRORS.RLP_PER_ID).isInt(),
  ]),
  handleValidation,

  // controller
  (req, res, next) => {
    createRolePermission(req.body)
      .then(respondRepository(res, { status: 201 }))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Deletes a rolePermission with the given `id` parameters and responds with
 * the deleted rolePermission.
 */
export const removeRolePermission: RequestHandler[] = [
  // validation
  checkExact([
    param("rlpRolId", ROLE_PERMISSION.ERRORS.RLP_ROL_ID).isInt(),
    param("rlpPerId", ROLE_PERMISSION.ERRORS.RLP_PER_ID).isInt(),
  ]),
  handleValidation,

  // controller
  (req, res, next) => {
    const { rlpRolId, rlpPerId } = req.params;
    deleteRolePermission(Number(rlpRolId), Number(rlpPerId))
      .then(respondRepositoryOrThrow(res))
      .catch(handleRepositoryError(next));
  },
];
