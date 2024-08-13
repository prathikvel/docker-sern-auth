import { Response, NextFunction } from "express";

import { EntitySetName } from "@/configs/global.config";
import {
  findPermissionTypesByEntity,
  findPermissionTypesByEntities,
} from "@/features/auth";
import { Database } from "@/models";
import { ClientError, ServerError } from "@/utils/error.util";

/** The set of options for the {@link respondRepository} utility function(s). */
interface ResponseOptions {
  /** The response's status code. */
  status?: number;
}

/**
 * Returns the standard callback to execute when a repository function's promise
 * is resolved. By default, the response status is 200, but it can be customized
 * in the options parameter.
 *
 * @param res The Express response object
 * @param options A set of custom options
 * @returns A callback to execute when repository function's promise is resolved
 */
export const respondRepository = <T>(
  res: Response,
  options?: ResponseOptions
) => {
  return (data: T) => {
    res.status(options?.status ?? 200).json({ data });
  };
};

/**
 * Returns the standard callback to execute when a repository function's promise
 * is resolved. If the resolved data is undefined, a ClientError is thrown. By
 * default, the response status is 200, but it can be customized in the options
 * parameter.
 *
 * @param res The Express response object
 * @param options A set of custom options
 * @returns A callback to execute when repository function's promise is resolved
 * @throws A ClientError if the repository function's resolved data is undefined
 */
export const respondRepositoryOrThrow = <T>(
  res: Response,
  options?: ResponseOptions
) => {
  return (data: T) => {
    if (!data) {
      throw new ClientError(406, "Invalid ID");
    }

    res.status(options?.status ?? 200).json({ data });
  };
};

/**
 * Returns the standard callback to execute when a repository function's promise
 * is rejected. MySQL errors are converted to a ClientError or ServerError. Full
 * MySQL errors are shown only in development. All errors are passed to the error
 * handler.
 *
 * @param next The Express next function
 * @returns A callback to execute when repository function's promise is rejected
 */
export const handleRepositoryError = (next: NextFunction) => {
  return (error: any) => {
    const DUPL_ERRNO = 1062;
    const isSqlError = Boolean(error?.errno);

    if (isSqlError) {
      if (error.errno === DUPL_ERRNO) {
        return next(new ClientError(406, "Duplicate entry", undefined, error));
      }

      return next(new ServerError(500, "Database error", undefined, error));
    }

    next(error);
  };
};

/**
 * Finds the user's permissions for the entity or each of the entities and adds
 * it to the object or each of the objects, respectively.
 *
 * @param usrId The user's `usrId`
 * @param set The name of the entity set
 * @param idProp The name of the entity's ID property
 * @returns The original repository data with the user's permissions included
 */
export const includeRepositoryPerms = <
  E extends EntitySetName,
  P extends keyof Database[E],
  T extends Record<P, number> & Record<string, any>
>(
  usrId: number,
  set: E,
  idProp: P
) => {
  return async (data: T | T[] | undefined) => {
    if (!data || (Array.isArray(data) && !data.length)) {
      return data;
    }

    // ----------------------- DATA IS OBJECT -----------------------

    if (!Array.isArray(data)) {
      // find entity permissions
      const entity = data[idProp];
      const permTypes = await findPermissionTypesByEntity(usrId, set, entity);

      // include permission types
      return { ...data, authorization: permTypes };
    }

    // ------------------------ DATA IS ARRAY -----------------------

    // find entities permissions
    const entities = data.map((v) => v[idProp]);
    const permsArr = await findPermissionTypesByEntities(usrId, set, entities);

    // splice entity set permissions
    let setPerms;
    const idx = permsArr.findIndex((v) => v.perEntity === null);
    if (idx !== -1) {
      [setPerms] = permsArr.splice(idx, 1);
    }

    // convert the output array to object and
    // union entity and entity set permissions
    const permsObj: Record<number, string[]> = {};
    for (const perEntity of entities) {
      permsObj[perEntity] = setPerms?.types ?? [];
    }
    for (const { perEntity, types } of permsArr) {
      const permTypes = types.concat(permsObj[perEntity!]);
      permsObj[perEntity!] = Array.from(new Set(permTypes));
    }

    // include permission types for each object
    return data.map((v) => ({ ...v, authorization: permsObj[v[idProp]] }));
  };
};

/**
 * Finds the user's entity-set permissions for the entity or each of the
 * entities and adds it to the object or each of the objects, respectively.
 *
 * @param usrId The user's `usrId`
 * @param set The name of the entity set
 * @returns The original repository data with the user's permissions included
 */
export const includeRepositorySetPerms = <T extends Record<string, any>>(
  usrId: number,
  set: EntitySetName
) => {
  return async (data: T | T[] | undefined) => {
    if (!data || (Array.isArray(data) && !data.length)) {
      return data;
    }

    // find entity permissions
    const permTypes = await findPermissionTypesByEntity(usrId, set, null);

    // include permission types
    if (!Array.isArray(data)) {
      return { ...data, authorization: permTypes };
    }
    return data.map((v) => ({ ...v, authorization: permTypes }));
  };
};
