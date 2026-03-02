import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import {
  ConnectionError,
  DatabaseError,
  TimeoutError,
  UniqueConstraintError,
  ValidationError,
} from "sequelize";

const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("=== ERROR ===", err);

  if (err instanceof ValidationError) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message:
        err instanceof UniqueConstraintError
          ? "User Already exists"
          : "Validation error",
      errors,
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(400).json({
      success: false,
      message: err.message,
      detail: (err as any).original?.detail,
    });
  }

  if (err instanceof ConnectionError || err instanceof TimeoutError) {
    return res.status(503).json({
      success: false,
      message: "Database connection error",
    });
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }


  if (err instanceof Error) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Server error",
  });
};

export default errorHandler;
