import { Request, Response, NextFunction, Router } from "express";
import HttpStatus from "http-status-codes";

export default abstract class ExpressController {
  protected abstract path: string;
  public router = Router();
  protected abstract mapRoutes(): void;

  protected sendSuccess(
    code: number = HttpStatus.OK,
    res: Response,
    data: any,
    message: string = "Success"
  ) {
    return res.status(code).json({
      data,
      message,
      success: true,
    });
  }

  protected sendSuccessList(
    code: number = HttpStatus.OK,
    res: Response,
    data: any,
    count: number,
    currentPage: number,
    limit: number,
    message: string = "Success"
  ) {
    return res.status(code).json({
      data,
      message,
      pagination: {
        currentPage,
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
      },
      success: true,
    });
  }

  protected sendError(
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    res: Response,
    error: any,
    message: string = "Internal Server Error"
  ) {
    const errorData = {
      message: error instanceof Error ? error.message : message,
      errors: error instanceof Error ? [error] : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      success: false,
    };
    return res.status(statusCode).json(errorData);
  }

  protected sendNotFound(res: Response, message: string = "Not Found") {
    const errorData = {
      message: message,
      errors: ["Resource not found"],
      stack: undefined,
      success: false,
    };
    return res.status(HttpStatus.NOT_FOUND).json(errorData);
  }

  protected sendUnauthorized(res: Response, message: string = "Unauthorized") {
    const errorData = {
      message: message,
      errors: ["Authentication required"],
      stack: undefined,
      success: false,
    };
    return res.status(HttpStatus.UNAUTHORIZED).json(errorData);
  }

  protected sendBadRequest(
    res: Response,
    message: string = "Bad Request",
    error?: any
  ) {
    const errorData = {
      message: error instanceof Error ? error.message : message,
      errors: error instanceof Error ? [error] : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      success: false,
    };

    return res.status(HttpStatus.BAD_REQUEST).json(errorData);
  }

  protected sendForbidden(res: Response, message: string = "Forbidden") {
    const errorData = {
      message: message,
      errors: ["Access denied"],
      stack: undefined,
      success: false,
    };
    return res.status(HttpStatus.FORBIDDEN).json(errorData);
  }
}
