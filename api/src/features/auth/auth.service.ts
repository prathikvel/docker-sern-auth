import bcrypt from "bcrypt";
import { DoneCallback } from "passport";
import { VerifyFunction } from "passport-local";

import { findUserAuthInfo } from "./auth.repository";
import { findUserByEmailWithPassword } from "../user";

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
    const match = await bcrypt.compare(password, user.usrPassword!);
    if (!match) {
      return done(null, false, { message: "Incorrect username or password." });
    }

    // find user auth info
    const authorization = await findUserAuthInfo(user.usrId);

    // return sanitized user
    delete user.usrPassword;
    return done(null, { ...user, authorization });
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
export const serializeUser = (user: Express.User, done: DoneCallback) => {
  process.nextTick(() => done(null, user));
};

/**
 * Helps to deserialize user objects out of the session.
 *
 * @param user The user to deserialize
 * @param done Passport's done callback
 * @returns Yields the result back to the strategy
 */
export const deserializeUser = (user: Express.User, done: DoneCallback) => {
  process.nextTick(() => done(null, user));
};
