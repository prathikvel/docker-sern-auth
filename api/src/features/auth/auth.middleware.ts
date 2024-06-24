import { RequestHandler } from "express";

import { AuthenticationError, AuthorizationError } from "@/utils/error.util";

import { checkUserPermission } from "../user";

/**
 * A middleware that checks if the user is authenticated. If authenticated,
 * the request proceeds. Otherwise, an AuthenticationError is passed to the
 * error handler.
 */
export const authenticationHandler: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  next(new AuthenticationError("Unauthorized"));
};

/**
 * A middleware that checks if the user is authorized with a permission. If
 * authorized, the request proceeds. Otherwise, an AuthorizationError is passed
 * to the error handler.
 *
 * @param permission The permission name to check user authorization for
 */
export const authorizationHandler = (permission: string): RequestHandler => {
  return async (req, res, next) => {
    const { usrId } = req.user!;
    const userPermission = await checkUserPermission(usrId, permission);

    if (userPermission) {
      return next();
    }

    next(new AuthorizationError("Forbidden"));
  };
};
