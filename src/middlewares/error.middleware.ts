import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/index";
import { ZodError } from "zod";
import { isAppError } from "../utils/errors";
import { logger } from "../utils/logger";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
};

export const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.flatten(),
      },
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return res.status(409).json({
      error: {
        code: "RESOURCE_CONFLICT",
        message: "A record with the provided unique value already exists",
      },
    });
  }

  if (isAppError(error)) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  logger.error(
    {
      err: error,
      path: req.originalUrl,
      method: req.method,
    },
    "Unhandled request error",
  );

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
