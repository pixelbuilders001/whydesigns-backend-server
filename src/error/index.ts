import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";

class ApiError extends Error {
  public readonly statusCode: number;
  public readonly data: any = null;
  public readonly success: boolean = false;
  public readonly errors: any;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends ApiError {
  constructor(
    message: string = "Bad Request",
    errors: any[] = [],
    stack?: string
  ) {
    super(400, message, errors, stack);
  }
}

export class AlreadyExistsError extends ApiError {
  constructor(
    message: string = "Already Exists",
    errors: any[] = [],
    stack?: string
  ) {
    super(StatusCodes.CONFLICT, message, errors, stack);
  }
}

export class NotFoundError extends ApiError {
  constructor(
    message: string = "Not Found",
    errors: any[] = [],
    stack?: string
  ) {
    super(404, message, errors, stack);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    message: string = "Unauthorized",
    errors: any[] = [],
    stack?: string
  ) {
    super(401, message, errors, stack);
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    message: string = "Forbidden",
    errors: any[] = [],
    stack?: string
  ) {
    super(403, message, errors, stack);
  }
}

export class InternalServerError extends ApiError {
  constructor(
    message: string = "Internal Server Error",
    errors: any[] = [],
    stack?: string
  ) {
    super(500, message, errors, stack);
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string = "Validation Error",
    errors: any[] = [],
    stack?: string
  ) {
    super(422, message, errors, stack);
  }
}

export { ApiError };

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  console.log("err", err);

  // Default to 500 if it's not an instance of ApiError
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default errorHandler;
