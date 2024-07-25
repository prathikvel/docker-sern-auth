import bcrypt from "bcrypt";
import { RequestHandler } from "express";
import { checkExact, param, body } from "express-validator";

import { handleValidation } from "@/middlewares/validation.middleware";
import {
  respondRepository,
  respondRepositoryOrThrow,
  handleRepositoryError,
} from "@/utils/controller.util";
import { ClientError } from "@/utils/error.util";

import { createPermissible, deletePermissible } from "../permissible";
import { CONFIG, ERROR_MESSAGES } from "./user.constants";
import {
  findUserById,
  findUserByIdWithPassword,
  findUsers,
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
  findUsers().then(respondRepository(res)).catch(handleRepositoryError(next));
};

/**
 * Responds with a user with the given `id` parameter.
 */
export const getUserById: RequestHandler[] = [
  // validation
  checkExact(param("id", ERROR_MESSAGES.usrId).isInt()),
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
    body("usrName", ERROR_MESSAGES.usrName).isAlpha(),
    body("usrEmail", ERROR_MESSAGES.usrEmail).isEmail(),
    body("usrPassword", ERROR_MESSAGES.usrPassword).isLength({
      min: CONFIG.pwdMinLength,
    }),
  ]),
  handleValidation,

  // controller
  async (req, res, next) => {
    req.body.usrPassword = await bcrypt.hash(
      req.body.usrPassword,
      CONFIG.pwdSaltRounds
    );

    const { pblId: usrId } = await createPermissible();
    createUser({ usrId, ...req.body })
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
    param("id", ERROR_MESSAGES.usrId).isInt(),
    body("usrName", ERROR_MESSAGES.usrName).isAlpha().optional(),
    body("usrEmail", ERROR_MESSAGES.usrEmail).isEmail().optional(),
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
    body("oldUsrPassword", ERROR_MESSAGES.oldUsrPassword).notEmpty(),
    body("newUsrPassword", ERROR_MESSAGES.newUsrPassword).isLength({
      min: CONFIG.pwdMinLength,
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
      return next(new ClientError(406, ERROR_MESSAGES.invalidCredentials));
    }

    // if password matches
    const match = await bcrypt.compare(oldUsrPassword, user.usrPassword!);
    if (!match) {
      return next(new ClientError(406, ERROR_MESSAGES.invalidCredentials));
    }

    // update new password
    const usrPassword = await bcrypt.hash(newUsrPassword, CONFIG.pwdSaltRounds);
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
  checkExact(param("id", ERROR_MESSAGES.usrId).isInt()),
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
