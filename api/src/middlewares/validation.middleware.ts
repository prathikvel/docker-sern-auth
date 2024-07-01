import { RequestHandler } from "express";
import { validationResult } from "express-validator";

import { ClientError } from "@/utils/error.util";

/**
 * A middleware that checks if there are validation errors. If there errors,
 * a ClientError is passed to the error handler. Otherwise, the request proceeds.
 */
export const validationHandler: RequestHandler = (req, res, next) => {
  const errors = validationResult(req).formatWith(
    // rename msg to message
    ({ msg: message, ...rest }) => ({ message, ...rest })
  );

  // handle validation errors
  if (!errors.isEmpty()) {
    // get error locations
    const locations = [];
    for (const error of errors.array()) {
      if (Object.hasOwn(error, "location")) {
        locations.push((error as any).location);
      }
    }

    const message = `Invalid ${locations.join(", ")}`;
    return next(new ClientError(406, message, { errors: errors.array() }));
  }

  next();
};
