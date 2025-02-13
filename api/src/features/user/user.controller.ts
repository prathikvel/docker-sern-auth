import bcrypt from "bcrypt";
import { RequestHandler } from "express";
import { matchedData } from "express-validator";

import { AUTH, USER } from "@/configs/global.config";
import {
  transformToResponse,
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
  includeRepositoryAuth,
} from "@/utils/controller.util";
import { ClientError } from "@/utils/error.util";

import { generateEntityPermissions } from "../permission";
import {
  findUserById,
  findUserByIdWithPassword,
  findUsers,
  findUsersByIds,
  createUser,
  updateUser,
  deleteUser,
} from "./user.repository";
import { createUserPermission } from "../user-permission";

/**
 * Responds with the current user.
 */
export const getCurrentUser: RequestHandler = (req, res) => {
  res.status(200).json({ data: req.user });
};

/**
 * Responds with all system users.
 */
export const getUsers: RequestHandler = (req, res, next) => {
  findUsers()
    .then(transformToResponse)
    .then(includeRepositoryAuth(req, "user", "usrId"))
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with a user with the given `id` parameter.
 */
export const getUserById: RequestHandler = (req, res, next) => {
  const { id } = matchedData(req, { locations: ["params"] });
  findUserById(id)
    .then(transformToResponse)
    .then(includeRepositoryAuth(req, "user", "usrId"))
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Responds with users with the given `ids` parameter.
 */
export const getUsersByIds: RequestHandler = (req, res, next) => {
  const { ids } = matchedData(req, { locations: ["params"] });
  findUsersByIds(ids)
    .then(transformToResponse)
    .then(includeRepositoryAuth(req, "user", "usrId"))
    .then(respondRepository(res))
    .catch(handleRepositoryError(next));
};

/**
 * Creates a new user with properties from `req.body` and responds with the
 * newly created user.
 */
export const addUser: RequestHandler = async (req, res, next) => {
  let { usrPassword } = req.body;
  usrPassword = await bcrypt.hash(usrPassword, AUTH.PWD_SALT_ROUNDS);

  createUser({ ...req.body, usrPassword })
    .then(async (data) => {
      if (data) {
        const { usrId } = data;

        const permissions = await generateEntityPermissions("user", usrId);
        for (const permission of permissions) {
          if (permission) {
            const { perId } = permission;
            await createUserPermission({ urpUsrId: usrId, urpPerId: perId });
          }
        }
      }

      return data;
    })
    .then(transformToResponse)
    .then(respondRepository(res, { status: 201 }))
    .catch(handleRepositoryError(next));
};

/**
 * Edits a user with the given `id` parameter and properties from `req.body`.
 * Edits all properties except `usrPassword`. Responds with the edited user.
 */
export const editUser: RequestHandler = (req, res, next) => {
  const { id } = matchedData(req, { locations: ["params"] });
  updateUser(id, req.body)
    .then(transformToResponse)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Changes a user password if the current password matches. Responds with the
 * edited user, which doesn't include the previous or current `usrPassword`.
 */
export const editUserPassword: RequestHandler = async (req, res, next) => {
  const { id } = matchedData(req, { locations: ["params"] });
  const { curUsrPassword, newUsrPassword } = req.body;

  // find given user
  const user = await findUserByIdWithPassword(id);
  if (!user) {
    return next(new ClientError(406, USER.ERRORS.INVALID_CREDENTIALS));
  }

  // if password matches
  const match = await bcrypt.compare(curUsrPassword, user.usrPassword!);
  if (!match) {
    return next(new ClientError(406, USER.ERRORS.INVALID_CREDENTIALS));
  }

  // update new password
  const usrPassword = await bcrypt.hash(newUsrPassword, AUTH.PWD_SALT_ROUNDS);
  updateUser(id, { usrPassword })
    .then(transformToResponse)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};

/**
 * Deletes a user with the given `id` parameter and responds with the deleted
 * user.
 */
export const removeUser: RequestHandler = (req, res, next) => {
  const { id } = matchedData(req, { locations: ["params"] });
  deleteUser(id)
    .then(transformToResponse)
    .then(respondRepositoryOrThrow(res))
    .catch(handleRepositoryError(next));
};
