import { RequestHandler } from "express";
import { validationResult } from "express-validator";

import { ClientError } from "@/utils/error.util";

/**
 * A middleware that checks if there are validation errors. If there errors,
 * a ClientError is passed to the error handler. Otherwise, the request proceeds.
 */
export const validationHandler: RequestHandler = (req, res, next) => {
  const errors = validationResult(req).formatWith((error) => {
    const { msg: message, ...rest } = error;
    switch (error.type) {
      case "field":
        // hide values
        delete error.value;
      case "alternative":
      case "alternative_grouped":
      case "unknown_fields":
        // rename msg to message
        return { message, ...rest };
      default:
        throw new Error("Unknown error type");
    }
  });

  // handle validation errors
  if (!errors.isEmpty()) {
    const message = "Validation error";
    return next(new ClientError(406, message, { errors: errors.array() }));
  }

  next();
};
