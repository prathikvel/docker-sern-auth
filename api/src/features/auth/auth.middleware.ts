import { RequestHandler } from "express";

import { EntitySetName, PermissionTypeName } from "@/configs/global.config";
import { AuthenticationError, AuthorizationError } from "@/utils/error.util";

import {
  checkEntityAccess,
  checkEntitiesAccess,
  findAccessibleEntities,
} from "./auth.repository";

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
 * How an entity is resolved:
 *
 * 1. If the entity argument is not null, go to step 3.
 * 2. If the entity argument is null, set it to `req.params.id` only if it's a
 *    number. If the entity is still null, the request fails.
 * 3. Check if the user has access to the entity. If so, the request proceeds.
 *
 * Here is some example usage:
 *
 * ```
 * // With default entity
 * handleEntityAuthorization("item", "read"); // or
 * handleEntityAuthorization("item", "read", null);
 *
 * // With a custom entity
 * handleEntityAuthorization("item", "read", 1);
 *
 * // ...or using a custom entity with a more common scenario
 * (req, res, next) => {
 *   return handleEntityAuthorization("item", "read", Number(req.params.itemId));
 * };
 * ```
 *
 * @param set The entity set to check access
 * @param type The permission type to check access
 * @param entity The optional entity's ID to check access
 */
export const handleEntityAuthorization = (
  set: EntitySetName,
  type: PermissionTypeName,
  entity: number | null = null
): RequestHandler => {
  return async (req, res, next) => {
    const { usrId } = req.user!;

    // entity resolution
    let resEntity = entity;
    if (resEntity === null) {
      if (!isNaN(Number(req.params.id))) {
        resEntity = Number(req.params.id);
      }
    }

    // entity management
    let isAuthorized;
    if (resEntity !== null) {
      isAuthorized = await checkEntityAccess(usrId, set, type, resEntity);
    }

    return isAuthorized ? next() : next(new AuthorizationError("Forbidden"));
  };
};

/**
 * A middleware that checks if the user is authorized with role or user-based
 * access to the given entities. If authorized, the request proceeds. Otherwise,
 * an AuthorizationError is passed to the error handler.
 *
 * How entities are resolved:
 *
 * 1. If the entities argument is not null, go to step 3.
 * 2. If the entities argument is null, set it to `req.params.ids` only if it
 *    is a string of comma-separated numbers. If the entities argument is still
 *    null, the request fails.
 * 3. Check if the user has access to the entities. If so, the request proceeds.
 *
 * Here is some example usage:
 *
 * ```
 * // With default entities
 * handleEntitiesAuthorization("item", "read"); // or
 * handleEntitiesAuthorization("item", "read", null);
 *
 * // With a custom entities
 * handleEntitiesAuthorization("item", "read", [1, 2, 3]);
 *
 * // ...or using a custom entities with a more common scenario
 * (req, res, next) => {
 *   const entities = req.params.itemIds.split(",").map(Number);
 *   return handleEntitiesAuthorization("item", "read", entities);
 * };
 * ```
 *
 * @param set The entity set to check access
 * @param type The permission type to check access
 * @param entities The optional entity IDs to check access
 */
export const handleEntitiesAuthorization = (
  set: EntitySetName,
  type: PermissionTypeName,
  entities: number[] | null = null
): RequestHandler => {
  return async (req, res, next) => {
    const { usrId } = req.user!;

    // entities resolution
    let resEntities = entities;
    if (resEntities === null) {
      if (/[\d,]+/.test(req.params.ids)) {
        resEntities = req.params.ids.split(",").filter(Boolean).map(Number);
      }
    }

    // entities management
    let isAuthorized;
    if (resEntities !== null) {
      isAuthorized = await checkEntityAccess(usrId, set, type, null);

      if (!isAuthorized) {
        isAuthorized = await checkEntitiesAccess(usrId, set, type, resEntities);
      }
    }

    return isAuthorized ? next() : next(new AuthorizationError("Forbidden"));
  };
};

/**
 * A middleware that checks if the user is authorized with role or user-based
 * access to the given entity set and permission type. If authorized, the request
 * proceeds. Otherwise, an AuthorizationError is passed to the error handler.
 *
 * How an entity set is resolved:
 *
 * 1. If entity set access is required via the corresponding argument, check if
 *    the user has access to the entity set. If so, the request proceeds.
 * 2. If entity set access isn't required, find all of the entities the user has
 *    access to. If the user has access to any entities, the following variables
 *    are set and the request proceeds.
 *      * If the user has entity set access:
 *        ```
 *        res.locals.authInfo = {
 *          entitySet: true,
 *        }
 *        ```
 *      * If the user has access to some entities:
 *        ```
 *        res.locals.authInfo = {
 *          entitySet: false,
 *          entities: accessibleEntities,
 *        }
 *        ```
 *
 * Here is some example usage:
 *
 * ```
 * // With default entity set
 * handleEntitySetAuthorization("item", "read"); // or
 * handleEntitySetAuthorization("item", "read", true);
 *
 * // Without entity set access
 * handleEntitySetAuthorization("item", "read", false);
 * ```
 *
 * @param set The entity set to check access
 * @param type The permission type to check access
 * @param entitySetAccess If entity set access is required
 */
export const handleEntitySetAuthorization = (
  set: EntitySetName,
  type: PermissionTypeName,
  entitySetAccess: boolean = true
): RequestHandler => {
  return async (req, res, next) => {
    const { usrId } = req.user!;

    // entity management
    let isAuthorized;
    if (entitySetAccess) {
      isAuthorized = await checkEntityAccess(usrId, set, type, null);
    } else {
      const entities = await findAccessibleEntities(usrId, set, type);

      isAuthorized = entities.length > 0;
      if (isAuthorized) {
        // pass entities information to controller
        if (entities.includes(null)) {
          res.locals.authInfo.entitySet = true;
        } else {
          res.locals.authInfo.entitySet = false;
          res.locals.authInfo.entities = entities;
        }
      }
    }

    return isAuthorized ? next() : next(new AuthorizationError("Forbidden"));
  };
};
