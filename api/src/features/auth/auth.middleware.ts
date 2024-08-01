import { RequestHandler } from "express";

import { EntitySet, PermissionType } from "@/configs/global.config";
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
 * If `entity` isn't defined, the middleware will use `req.param.id` only if
 * `req.param.id` is number. Otherwise, the middleware will ignore the entity
 * and will only check for entity set permissions.
 *
 * Here is some example usage:
 *
 * ```
 * // With default entity
 * handleAuthorization("item", "read");
 *
 * // With a custom entity
 * handleAuthorization("item", "read", 1);
 *
 * // ...or using a custom entity with a more common scenario
 * (req, res, next) => {
 *   return handleAuthorization("item", "read", Number(req.params.itemId));
 * }
 * ```
 *
 * @param set The permission set to check access
 * @param type The permission type to check access
 * @param entity The optional entity's ID to check access
 */
export const handleAuthorization = (
  set: EntitySet,
  type: PermissionType,
  entity?: number | null
): RequestHandler => {
  return async (req, res, next) => {
    const { usrId } = req.user!;

    // entity resolution
    let resolvedEntity = null;
    if (entity) {
      resolvedEntity = entity;
    } else if (!isNaN(Number(req.params.id))) {
      resolvedEntity = Number(req.params.id);
    }

    // role-based access
    if (await checkRoleBasedAccess(usrId, set, type, resolvedEntity)) {
      return next();
    }

    // user-based access
    if (await checkUserBasedAccess(usrId, set, type, resolvedEntity)) {
      return next();
    }

    next(new AuthorizationError("Forbidden"));
  };
};
