import bcrypt from "bcrypt";
import { RequestHandler } from "express";

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
  findUsers()
    .then((data) => res.status(200).json({ data }))
    .catch(next);
};

/**
 * Responds with a user with the given `id` parameter.
 */
export const getUserById: RequestHandler = (req, res, next) => {
  const id = Number(req.params.id);

  findUserById(id)
    .then((data) => res.status(200).json({ data }))
    .catch(next);
};

/**
 * Creates a new user with properties from `req.body` and responds with the
 * newly created user.
 */
export const addUser: RequestHandler = async (req, res, next) => {
  req.body.usrPassword = await bcrypt.hash(req.body.usrPassword, 10);

  createUser(req.body)
    .then((data) => res.status(201).json({ data }))
    .catch(next);
};

/**
 * Edits a user with the given `id` parameter and properties from `req.body`.
 * Edits all properties except `usrPassword`. Responds with the edited user.
 */
export const editUser: RequestHandler = (req, res, next) => {
  const id = Number(req.params.id);

  // doesn't update password
  delete req.body.usrPassword;

  updateUser(id, req.body)
    .then((data) => res.status(200).json({ data }))
    .catch(next);
};

/**
 * Changes a user password if the current password matches. Responds with the
 * edited user, which doesn't include the previous or current `usrPassword`.
 */
export const editUserPassword: RequestHandler = async (req, res, next) => {
  const id = Number(req.params.id);
  const { oldUsrPassword, newUsrPassword } = req.body;

  // find given user
  const user = await findUserByIdWithPassword(id);
  if (!user) {
    return next();
  }

  // if password matches
  const match = await bcrypt.compare(oldUsrPassword, user.usrPassword!);
  if (!match) {
    return next();
  }

  // update new password
  const usrPassword = await bcrypt.hash(newUsrPassword, 10);
  updateUser(id, { usrPassword })
    .then((data) => res.status(200).json({ data }))
    .catch(next);
};

/**
 * Deletes a user with the given `id` parameter and responds with the deleted
 * user.
 */
export const removeUser: RequestHandler = (req, res, next) => {
  const id = Number(req.params.id);

  deleteUser(id)
    .then((data) => res.status(200).json({ data }))
    .catch(next);
};
