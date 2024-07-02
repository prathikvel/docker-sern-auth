import { Response } from "express";

import { ClientError } from "@/utils/error.util";

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
