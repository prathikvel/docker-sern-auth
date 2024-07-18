import { RequestHandler } from "express";

import { AuthenticationError, AuthorizationError } from "@/utils/error.util";

import { checkRoleBasedAccess } from "./auth.repository";
import { CUBAFunction } from "./auth.types";

/** The set of options for the {@link handleAuthorization} middleware. */
interface HandleAuthorizationOptions<T> {
  /** The value of the resource's ID. */
  resourceId?: number | string | null;
  /** An object of all resource's IDs. */
  resourceIds?: Partial<T>;
}

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
 * A middleware that checks if the user is authorized with role-based access or
 * user-based access. Role-based access is defined by a user having role(s) that
 * have the given permission. User-based access is resource-specific and defined
 * as a custom function; it often grants access to resource-owners. If authorized,
 * the request proceeds. Otherwise, an AuthorizationError is passed to the error
 * handler.
 *
 * By default, `checkUserBasedAccess` will use `req.params.id` as the resourceId.
 * If customization is required, the resourceId can be set in the options param.
 * The resourceId is the value of the resource's ID. If a resource has multiple
 * IDs or if it's necessary to be declarative, the resourceIds can be set in the
 * options param. The resourceIds is an object with resource ID keys and values.
 *
 * Here is some example usage:
 *
 * ```
 * // With only role-based access
 * handleAuthorization("item:read");
 *
 * // With role-based and simple user-based access
 * handleAuthorization("item:read", checkUserBasedAccess);
 *
 * // With role-based and named resourceId for user-based access
 * handleAuthorization("item:read", checkUserBasedAccess, { resourceId: 1 });
 *
 * // ...or using a named resourceId with a more common scenario
 * (req, res, next) => {
 *   return handleAuthorization("item:read", checkUserBasedAccess, {
 *     resourceId: req.params.itemId, // resourceId will be parsed to a number
 *   });
 * }
 *
 * // With role-based and named resourceIds for user-based access
 * (req, res, next) => {
 *   const { itemId, anotherId } = req.params;
 *   return handleAuthorization("item:read", checkUserBasedAccess, {
 *     // resourceIds will NOT be parsed to a number
 *     resourceIds: { itemId: Number(itemId), anotherId: Number(anotherId) },
 *   });
 * }
 * ```
 *
 * @param permissionName The permission name to check role-based access
 * @param checkUserBasedAccess The function to check user-based access
 * @param options A set of custom options, including a custom resourceId
 */
export const handleAuthorization = <T>(
  permissionName: string,
  checkUserBasedAccess?: CUBAFunction<T>,
  options: HandleAuthorizationOptions<T> = {}
): RequestHandler => {
  return async (req, res, next) => {
    const { usrId } = req.user!;

    // role-based access
    const roleBasedAccess = await checkRoleBasedAccess(usrId, permissionName);
    if (roleBasedAccess) {
      return next();
    }

    // user-based access
    if (checkUserBasedAccess) {
      let { resourceId: resId = req.params.id, resourceIds: resIds } = options;

      // validate options
      if (resIds) {
        resId = null;
      } else if (resId && !isNaN(Number(resId))) {
        resId = Number(resId);
      } else {
        return next(new TypeError("Invalid arguments"));
      }

      const userBasedAccess = await checkUserBasedAccess(usrId, resId, resIds);
      if (userBasedAccess) {
        return next();
      }
    }

    next(new AuthorizationError("Forbidden"));
  };
};
