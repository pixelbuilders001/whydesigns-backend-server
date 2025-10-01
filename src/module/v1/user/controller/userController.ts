import { Request, Response } from "express";
import asyncHandler from "../../../../common/asyncHandler";
import ExpressController from "../../../../common/ExpressController";
import UserService from "../service/userService";
import { StatusCodes } from "http-status-codes";
import { authMiddleware } from "../../../../middleware/authMiddleware";
import { UserFilterType } from "../service/validation";
import { userService } from "../../../../factory/ServiceFactory";
import { UserResponse } from "../type";

export default class UserController extends ExpressController {
  protected path = "/user";
  private userService: UserService;

  constructor(userService: UserService) {
    super();
    this.userService = userService;
    this.mapRoutes();
  }

  protected mapRoutes(): void {
    this.router.post(`${this.path}/signup`, asyncHandler(this.createuser));
    this.router.post(`${this.path}/signin`, asyncHandler(this.signIn));
    this.router.post(
      `${this.path}/refresh-token`,
      asyncHandler(this.refreshToken)
    );
    this.router.get(
      `${this.path}/loggedin-user-details`,
      authMiddleware,
      asyncHandler(this.getLoggedInUserDetails)
    );

    // Get current authenticated user
    this.router.get(
      `${this.path}/me`,
      authMiddleware,
      asyncHandler(this.getCurrentUser)
    );
    this.router.get(
      `${this.path}/all-users`,
      authMiddleware,
      asyncHandler(this.getAllUsers)
    );
    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      asyncHandler(this.getUserById)
    );
    this.router.post(
      `${this.path}/verify-email`,
      asyncHandler(this.verifyUserEmail)
    );
    this.router.post(
      `${this.path}/resend-email-otp`,
      asyncHandler(this.resendEmailOtp)
    );
    this.router.post(
      `${this.path}/forgot-password/request-otp`,
      asyncHandler(this.requestForgotPasswordOtp)
    );
    this.router.post(
      `${this.path}/forgot-password/verify-otp`,
      asyncHandler(this.verifyForgotPasswordOtp)
    );
    this.router.post(
      `${this.path}/reset-password`,
      asyncHandler(this.resetPassword)
    );
    this.router.post(`${this.path}/google-auth`, asyncHandler(this.googleAuth));

    // Logout endpoint
    this.router.post(
      `${this.path}/logout`,
      authMiddleware,
      asyncHandler(this.logout)
    );
  }

  createuser = async (req: Request, res: Response) => {
    const user = await this.userService.createUser(req.body);
    return this.sendSuccess(
      StatusCodes.CREATED,
      res,
      user,
      "Sign up successfully."
    );
  };

  signIn = async (req: Request, res: Response) => {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password)
      return this.sendBadRequest(res, "Please provide credentials.");

    const user = await this.userService.signIn(emailOrPhone, password);

    const isProd = process.env.NODE_ENV === "production";

    // Set access token in HttpOnly cookie for auth middleware to read
    res.cookie("accessToken", user.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour to match access token expiry
      path: "/",
    });

    // Also set refresh token cookie, scoped to refresh endpoint
    res.cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days to match refresh token expiry
      path: "/api/v1/user/refresh-token",
    });

    return this.sendSuccess(
      StatusCodes.OK,
      res,
      user,
      "Logged in successfully."
    );
  };

  refreshToken = async (req: Request, res: Response): Promise<any> => {
    // Read refresh token from body fallback to HttpOnly cookie
    const tokenFromBody = (req.body && req.body.refreshToken) as
      | string
      | undefined;
    const tokenFromCookie = (req as any).cookies?.refreshToken as
      | string
      | undefined;
    const token = tokenFromBody || tokenFromCookie;

    if (!token)
      return this.sendBadRequest(res, "Please provide refresh token.");

    const newToken = await this.userService.refreshToken(token);

    return this.sendSuccess(StatusCodes.OK, res, newToken);
  };

  logout = async (req: Request, res: Response) => {
    const userId = (req as any).userId;

    // Clear the refresh token from the database
    await this.userService.updateRefreshToken(userId, null);

    // Clear the access token cookie
    res.clearCookie("accessToken", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      path: "/api/v1/user/refresh-token",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return this.sendSuccess(StatusCodes.OK, res, {}, "Successfully logged out");
  };

  getCurrentUser = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const user = await this.userService.getUserById(userId);
    return this.sendSuccess(StatusCodes.OK, res, user);
  };

  getLoggedInUserDetails = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const user = await this.userService.getUserById(userId);
    return this.sendSuccess(StatusCodes.OK, res, user);
  };

  getUserById = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = await this.userService.getUserById(parseInt(userId));
    return this.sendSuccess(StatusCodes.OK, res, user);
  };

  getAllUsers = async (req: Request, res: Response) => {
    const { limit, page, ...filter } = req.query;
    const limitValue = parseInt(limit as string) || 10;
    const pageValue = parseInt(page as string) || 1;
    const { rows: users, count } = await this.userService.getAllUsers(
      limitValue,
      pageValue,
      filter as UserFilterType
    );
    return this.sendSuccessList(
      StatusCodes.OK,
      res,
      users,
      count,
      pageValue,
      limitValue,
      "Success"
    );
  };

  verifyUserEmail = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    if (!email || !otp)
      return this.sendBadRequest(res, "Please provide email and otp.");
    await this.userService.verifyUserEmail(email, otp);
    return this.sendSuccess(
      StatusCodes.OK,
      res,
      "Email verified successfully."
    );
  };

  resendEmailOtp = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return this.sendBadRequest(res, "Please provide email.");
    await this.userService.resendEmailOtp(email);
    return this.sendSuccess(StatusCodes.OK, res, "OTP sent successfully.");
  };

  requestForgotPasswordOtp = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return this.sendBadRequest(res, "Please provide email.");
    await this.userService.requestForgotPasswordOtp(email);
    return this.sendSuccess(StatusCodes.OK, res, "OTP sent successfully.");
  };

  verifyForgotPasswordOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    if (!email || !otp)
      return this.sendBadRequest(res, "Please provide email and otp.");
    const message = await this.userService.verifyForgotPasswordOtp(email, otp);
    return this.sendSuccess(StatusCodes.OK, res, message);
  };

  resetPassword = async (req: Request, res: Response) => {
    await this.userService.resetPassword(req.body);
    return this.sendSuccess(
      StatusCodes.OK,
      res,
      "Password reset successfully."
    );
  };

  googleAuth = async (req: Request, res: Response) => {
    const { googleToken } = req.body;
    if (!googleToken) return this.sendBadRequest(res, "Please provide token.");
    const user = await this.userService.googleAuth(googleToken);
    return this.sendSuccess(StatusCodes.OK, res, user);
  };
}

export const userController = new UserController(userService);
