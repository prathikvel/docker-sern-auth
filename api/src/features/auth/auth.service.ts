import bcrypt from "bcrypt";
import { DoneCallback } from "passport";
import { VerifyFunction } from "passport-local";

import { findUserById, findUserByEmailWithPassword } from "../user";

type SerializeUserFunction = (
  user: Express.User,
  done: (err: any, id?: number) => void
) => void;

type DeserializeUserFunction = (id: number, done: DoneCallback) => void;

/**
 * Verifies the given email and password. If the credentials are valid, it
 * calls the callback with the authenticating user. If the credentials are
 * invalid or don't belong to a known user, it calls the callback with false,
 * which indicates an authentication failure. If an error occurs, the callback
 * is called with an error.
 *
 * @param email An email to verify
 * @param password A password to verify
 * @param done Passport's done callback
 * @returns Yields the result back to the strategy
 */
export const verify: VerifyFunction = async (email, password, done) => {
  try {
    // if email exists
    const user = await findUserByEmailWithPassword(email);
    if (!user) {
      return done(null, false, { message: "Incorrect username or password." });
    }

    // if password matches
    const match = await bcrypt.compare(password, user.usr_password!);
    if (!match) {
      return done(null, false, { message: "Incorrect username or password." });
    }

    // return sanitized user
    delete user.usr_password;
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

/**
 * Helps to serialize user objects into the session.
 *
 * @param user The user to serialize
 * @param done Passport's done callback
 */
export const serializeUser: SerializeUserFunction = (user, done) => {
  process.nextTick(() => done(null, user.usr_id));
};

/**
 * Helps to deserialize user objects out of the session.
 *
 * @param id The user id to deserialize
 * @param done Passport's done callback
 * @returns Yields the result back to the strategy
 */
export const deserializeUser: DeserializeUserFunction = async (id, done) => {
  try {
    const user = await findUserById(id);

    return done(null, user);
  } catch (err) {
    return done(err);
  }
};
