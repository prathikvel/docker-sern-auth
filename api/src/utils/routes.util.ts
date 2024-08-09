import { RequestHandler } from "express";

/**
 * Converts an object of validation, middleware, and/or controller handlers into
 * a flat array.
 */
export const handlers = ({
  validation: v,
  middleware: m,
  controller: c,
}: {
  validation?: RequestHandler | RequestHandler[];
  middleware?: RequestHandler | RequestHandler[];
  controller: RequestHandler | RequestHandler[];
}) => [v, m, c].filter(Boolean).flat() as RequestHandler[];
