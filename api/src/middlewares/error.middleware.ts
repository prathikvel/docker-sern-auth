import { RequestHandler, ErrorRequestHandler } from "express";

import { CustomError, ClientError, ServerError } from "@/utils/error.util";

/**
 * Handles a request for an invalid resource. Passes a ClientError with 404
 * status to the error handler.
 */
const notFoundHandler: RequestHandler = (req, res, next) => {
  next(new ClientError(404, "Not Found"));
};

/**
 * Handles errors in route handlers and middleware. If the app is running in
 * in production, the name, status, message, and production errors are passed
 * to the response. Otherwise, all error attributes are passed to the response.
 * Uses the error status if it's set. Otherwise, sets the response status to 500.
 */
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  // convert error
  if (!(error instanceof CustomError)) {
    const message = error?.message ?? "Internal error";
    error = new ServerError(500, message, undefined, error);
  }

  // parse error
  error = JSON.parse(JSON.stringify(error));
  const { errorProd, errorDev, ...origErr } = error;

  // clean error
  if (process.env.NODE_ENV === "production") {
    const { name, status, message } = origErr;
    error = { name, status, message, ...errorProd };
  } else {
    error = { ...origErr, ...errorProd, ...errorDev };
  }

  res.status(error?.status ?? 500).json({ error });
};

export default [notFoundHandler, errorHandler];
