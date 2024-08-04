import bcrypt from "bcrypt";
import { RequestHandler } from "express";
import { checkExact, param, body } from "express-validator";

import { AUTH, USER, ERRORS } from "@/configs/global.config";
import { handleValidation } from "@/middlewares/validation.middleware";
import {
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
} from "@/utils/controller.util";
import { ClientError, ServerError } from "@/utils/error.util";

import { createPermissible, deletePermissible } from "../permissible";
import {
  findUserById,
  findUserByIdWithPassword,
  findUsers,
  findUsersByIds,
  createUser,
  updateUser,
  deleteUser,
} from "./user.repository";

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
  const { authInfo } = res.locals;
  if (authInfo) {
    if (authInfo.allEntities) {
      findUsers()
        .then(respondRepository(res))
        .catch(handleRepositoryError(next));
    } else {
      findUsersByIds(authInfo.entities)
        .then(respondRepository(res))
        .catch(handleRepositoryError(next));
    }
  } else {
    next(new ServerError(500, ERRORS[500]));
  }
};

/**
 * Responds with a user with the given `id` parameter.
 */
export const getUserById: RequestHandler[] = [
  // validation
  checkExact(param("id", USER.ERRORS.USR_ID).isInt()),
  handleValidation,

  // controller
  (req, res, next) => {
    const id = Number(req.params.id);
    findUserById(id)
      .then(respondRepositoryOrThrow(res))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Creates a new user with properties from `req.body` and responds with the
 * newly created user.
 */
export const addUser: RequestHandler[] = [
  // validation
  checkExact([
    body("usrName", USER.ERRORS.USR_NAME).isAlpha(),
    body("usrEmail", USER.ERRORS.USR_EMAIL).isEmail(),
    body("usrPassword", USER.ERRORS.USR_PASSWORD).isLength({
      min: AUTH.PWD_MIN_LENGTH,
    }),
  ]),
  handleValidation,

  // controller
  async (req, res, next) => {
    let { usrPassword } = req.body;
    usrPassword = await bcrypt.hash(usrPassword, AUTH.PWD_SALT_ROUNDS);

    const { pblId: usrId } = await createPermissible();
    createUser({ usrId, ...req.body, usrPassword })
      .then(respondRepository(res, { status: 201 }))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Edits a user with the given `id` parameter and properties from `req.body`.
 * Edits all properties except `usrPassword`. Responds with the edited user.
 */
export const editUser: RequestHandler[] = [
  // validation
  checkExact([
    param("id", USER.ERRORS.USR_ID).isInt(),
    body("usrName", USER.ERRORS.USR_NAME).isAlpha().optional(),
    body("usrEmail", USER.ERRORS.USR_EMAIL).isEmail().optional(),
  ]),
  handleValidation,

  // controller
  (req, res, next) => {
    const id = Number(req.params.id);
    updateUser(id, req.body)
      .then(respondRepositoryOrThrow(res))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Changes a user password if the current password matches. Responds with the
 * edited user, which doesn't include the previous or current `usrPassword`.
 */
export const editUserPassword: RequestHandler[] = [
  // validation
  checkExact([
    param("id").isInt(),
    body("oldUsrPassword", USER.ERRORS.OLD_USR_PASSWORD).notEmpty(),
    body("newUsrPassword", USER.ERRORS.NEW_USR_PASSWORD).isLength({
      min: AUTH.PWD_MIN_LENGTH,
    }),
  ]),
  handleValidation,

  // controller
  async (req, res, next) => {
    const id = Number(req.params.id);
    const { oldUsrPassword, newUsrPassword } = req.body;

    // find given user
    const user = await findUserByIdWithPassword(id);
    if (!user) {
      return next(new ClientError(406, USER.ERRORS.INVALID_CREDENTIALS));
    }

    // if password matches
    const match = await bcrypt.compare(oldUsrPassword, user.usrPassword!);
    if (!match) {
      return next(new ClientError(406, USER.ERRORS.INVALID_CREDENTIALS));
    }

    // update new password
    const usrPassword = await bcrypt.hash(newUsrPassword, AUTH.PWD_SALT_ROUNDS);
    updateUser(id, { usrPassword })
      .then(respondRepositoryOrThrow(res))
      .catch(handleRepositoryError(next));
  },
];

/**
 * Deletes a user with the given `id` parameter and responds with the deleted
 * user.
 */
export const removeUser: RequestHandler[] = [
  // validation
  checkExact(param("id", USER.ERRORS.USR_ID).isInt()),
  handleValidation,

  // controller
  (req, res, next) => {
    const id = Number(req.params.id);
    deleteUser(id)
      .then(respondRepositoryOrThrow(res))
      .then(() => deletePermissible(id))
      .catch(handleRepositoryError(next));
  },
];
