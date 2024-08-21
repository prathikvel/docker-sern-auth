import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";

import { EntitySetName } from "@/configs/global.config";
import { findPermissionTypesByEntity } from "@/features/auth";
import { Database } from "@/models";
import { ClientError, ServerError } from "@/utils/error.util";
import { CustomRecord } from "@/utils/types.util";

/** The repository function's resolved data. */
type Data<T> = T | T[] | undefined;

/** An object with the repository function's resolved data and metadata. */
export type ResponseObject<T> = { data: Data<T>; metadata: CustomRecord };

/** An array of a user's permission types for an entity or entity set. */
type Authorization = { authorization?: string[] };

/** The {@link ResponseObject} with its data including an authorization. */
type ResponseObjectWithAuth<T> = Promise<ResponseObject<T & Authorization>>;

/** The set of options for the {@link respondRepository} utility function(s). */
interface ResponseOptions {
  /** The response's status code. */
  status?: number;
}

/**
 * Transforms the data to a response object with data and metadata properties.
 *
 * @param data The repository function's resolved data
 * @returns An object with data and metadata properties
 */
export const transformToResponse = <T>(data: Data<T> | ResponseObject<T>) => {
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    if (["data", "metadata"].every((v) => Object.hasOwn(data, v))) {
      return data as unknown as ResponseObject<T>;
    }
  }

  return { data, metadata: {} } as ResponseObject<T>;
};

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
  return (response: ResponseObject<T>) => {
    res.status(options?.status ?? 200).json(response);
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
  return (response: ResponseObject<T>) => {
    if (!response) {
      throw new ClientError(406, "Invalid ID");
    }

    res.status(options?.status ?? 200).json(response);
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
 * Finds the user's entity permissions for the entity or each of the entities
 * and adds it to the object or each of the objects, respectively. Finds the
 * user's entity-set permissions for the entity set and adds it to the metadata.
 * The permissions are only included if `req.query.permissions` is set to true.
 *
 * @param req The Express request object
 * @param set The name of the entity set
 * @param id The name of the entity's ID property
 * @returns The original repository response with the user's permissions added
 */
export const includeRepositoryAuth = <
  E extends EntitySetName,
  K extends keyof Database[E],
  T extends Record<K, number>
>(
  req: Request,
  set: E,
  id: K
) => {
  return async (response: ResponseObject<T>): ResponseObjectWithAuth<T> => {
    const { usrId } = req.user!;
    const { data, metadata } = response;
    const { authorization } = matchedData(req, { locations: ["query"] });

    if (!authorization || !data || (Array.isArray(data) && !data.length)) {
      return response;
    }

    // ------------------- DATA IS OBJECT OR ARRAY ------------------

    // find entity permissions
    const entity = !Array.isArray(data) ? data[id] : data.map((v) => v[id]);
    const permsArr = await findPermissionTypesByEntity(usrId, set, entity);

    // splice entity set permissions
    let entitySetPerms;
    const idx = permsArr.findIndex((v) => v.perEntity === null);
    if (idx !== -1) {
      [entitySetPerms] = permsArr.splice(idx, 1);
    }

    // add entity set permissions to metadata
    const entitySetAuth = entitySetPerms?.types ?? [];
    const metadataWithAuth = { ...metadata, authorization: entitySetAuth };

    // ----------------------- DATA IS OBJECT -----------------------

    if (!Array.isArray(data)) {
      const [entityPerms] = permsArr;
      const entityAuth = entityPerms?.types ?? [];
      const dataWithAuth = { ...data, authorization: entityAuth };
      return { data: dataWithAuth, metadata: metadataWithAuth };
    }

    // ------------------------ DATA IS ARRAY -----------------------

    // convert the output array to object
    const permsObj: Record<number, string[]> = {};
    permsArr.forEach((v) => (permsObj[v.perEntity!] = v.types));

    // include permission types for each object
    const dataWithAuth = data.map((v) => {
      const entityAuth = permsObj[v[id]] ?? [];
      return { ...v, authorization: entityAuth };
    });
    return { data: dataWithAuth, metadata: metadataWithAuth };
  };
};

/**
 * Finds the user's entity-set permissions for the entity set and adds it to
 * the metadata. The permissions are only included if `req.query.permissions`
 * is set to true.
 *
 * @param req The Express request object
 * @param set The name of the entity set
 * @returns The original repository response with the user's permissions added
 */
export const includeRepositorySetAuth = <T>(
  req: Request,
  set: EntitySetName
) => {
  return async (response: ResponseObject<T>): Promise<ResponseObject<T>> => {
    const { usrId } = req.user!;
    const { data, metadata } = response;
    const { authorization } = matchedData(req, { locations: ["query"] });

    if (!authorization || !data || (Array.isArray(data) && !data.length)) {
      return response;
    }

    // ------------------- DATA IS OBJECT OR ARRAY ------------------

    // find entity permissions
    const permsArr = await findPermissionTypesByEntity(usrId, set, null);

    // add entity set permissions to metadata
    const [entitySetPerms] = permsArr;
    const entitySetAuth = entitySetPerms?.types ?? [];
    const metadataWithAuth = { ...metadata, authorization: entitySetAuth };
    return { data, metadata: metadataWithAuth };
  };
};
