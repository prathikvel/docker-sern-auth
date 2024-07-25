import { RequestHandler } from "express";

import { AuthenticationError, AuthorizationError } from "@/utils/error.util";

import { checkRoleBasedAccess, checkUserBasedAccess } from "./auth.repository";

/**
 * A middleware that checks if the user is authenticated. If authenticated,
 * the request proceeds. Otherwise, an AuthenticationError is passed to the
 * error handler.
 */
export const handleAuthentication: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  next(new AuthenticationError("Unauthorized"));
};

/**
 * A middleware that checks if the user is authorized with role or user-based
 * access to the given entity. If authorized, the request proceeds. Otherwise,
 * an AuthorizationError is passed to the error handler.
 *
 * If `entityId` isn't defined, the middleware will use `req.param.id` only if
 * `req.param.id` is a number. Otherwise, the middleware will ignore the entity
 * and will only check for entity set permissions.
 *
 * Here is some example usage:
 *
 * ```
 * // With default entity
 * handleAuthorization("item:read");
 *
 * // With a custom entity
 * handleAuthorization("item:read", 1);
 *
 * // ...or using a custom entity with a more common scenario
 * (req, res, next) => {
 *   return handleAuthorization("item:read", Number(req.params.itemId));
 * }
 * ```
 *
 * @param perName The permission name to check access
 * @param entityId The optional entity's ID to check access
 */
export const handleAuthorization = (
  perName: string,
  entityId?: number
): RequestHandler => {
  return async (req, res, next) => {
    const { usrId } = req.user!;

    // entity resolution
    let perPblId = -1;
    if (entityId) {
      perPblId = entityId;
    } else if (!isNaN(Number(req.params.id))) {
      perPblId = Number(req.params.id);
    }

    // role-based access
    const roleBased = await checkRoleBasedAccess(usrId, perName, perPblId);
    if (roleBased) {
      return next();
    }

    // user-based access
    const userBased = await checkUserBasedAccess(usrId, perName, perPblId);
    if (userBased) {
      return next();
    }

    next(new AuthorizationError("Forbidden"));
  };
};
