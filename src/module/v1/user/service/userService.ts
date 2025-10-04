import MailService from "../../../../adapters/mail/MailService";
import { otpTemplate } from "../../../../common/htmlTemplate";
import { LoggerAdapterFactory } from "../../../../factory/LoggerFactory";
import {
  AlreadyExistsError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../../../error";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../../utils/jwt";
import { generateOtp } from "../../../../utils/otp";
import { validatePayloadSchema } from "../../../../utils/zod";
import { IRoleRepository } from "../../role/repository/roleRepostory";
import { IUserRepository } from "../repository/userRepository";
import { UserResponse } from "../type";
import {
  ResetPasswordSchema,
  UserFilterSchema,
  UserFilterType,
  UserPayloadType,
  UserUpdateType,
  userSchema,
  UserSignInSchema,
  userUpdateSchema,
} from "./validation";
import { ILoggerAdapter } from "../../../../adapters/logger/LoggerAdapter";
import { IStorageAdapter } from "../../../../adapters/storage/type";
import { config } from "../../../../config";
import { IOtpRepository, OtpPurpose } from "../../otp/repository/otpRepository";
import axios from "axios";

export default class UserService {
  private userRepository: IUserRepository;
  private roleRepository: IRoleRepository;
  private otpRepository: IOtpRepository;
  private mailService: typeof MailService;
  private logger: ILoggerAdapter;
  private storageAdapter: IStorageAdapter;

  constructor(
    userRepository: IUserRepository,
    roleRepository: IRoleRepository,
    otpRepository: IOtpRepository,
    mailService: typeof MailService,
    storageAdapter: IStorageAdapter
  ) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.otpRepository = otpRepository;
    this.mailService = mailService;
    this.logger = LoggerAdapterFactory.getAdapter(
      process.env.LOG_PROVIDER || "winston"
    );
    this.storageAdapter = storageAdapter;
  }

  async createUser(user: UserPayloadType): Promise<UserResponse> {
    const validatePayload = validatePayloadSchema(userSchema, user);
    console.log(validatePayload.phoneNumber);
    // check if email or phone number exist
    const [existingUserByEmail, existingUserByPhone] = await Promise.all([
      this.getUserByFilter({ email: validatePayload.email }),
      validatePayload.phoneNumber
        ? this.getUserByFilter({ phoneNumber: validatePayload.phoneNumber })
        : null,
    ]);

    if (existingUserByEmail && existingUserByEmail?.email === user.email) {
      throw new AlreadyExistsError("User with this email already exists");
    }

    if (
      existingUserByPhone &&
      existingUserByPhone?.phoneNumber === user.phoneNumber
    ) {
      throw new AlreadyExistsError(
        "User with this phone number already exists"
      );
    }

    // get user role if exist else create
    const userRole = await this.roleRepository.getRoleByName("user");
    let roleId;
    if (!userRole) {
      const role = await this.roleRepository.createRole({
        name: "user",
        description: "User role",
      });
      roleId = role.id;
    } else {
      roleId = userRole.id;
    }

    // create user
    const newUser = await this.userRepository.createUser({
      ...validatePayload,
      roleId,
    });

    if (!newUser) {
      this.logger.error("Failed to create user", { email: user.email });
      throw new InternalServerError("User not created");
    }

    // send email verification otp
    const otp = generateOtp();

    await this.otpRepository.saveOtp({
      userId: newUser.id,
      purpose: OtpPurpose.EMAIL_VERIFICATION,
      otp,
      identifier: newUser.email ?? null,
      expiresAt: new Date(Date.now() + Number(config.otp.EXPIRE_TIME)),
      metadata: { email: newUser.email },
    });

    const result = await this.mailService.sendMail(
      newUser.email,
      "Welcome to Why Designers | Please verify your email",
      otpTemplate(otp)
    );

    if (!result) {
      this.logger.error("Failed to send email verification OTP", {
        email: newUser.email,
      });
      throw new InternalServerError("Failed to send email verification OTP");
    }
    return newUser;
  }

  async updateUser(
    userId: number,
    user: UserUpdateType
  ): Promise<UserResponse> {
    const validatePayload = validatePayloadSchema(userUpdateSchema, user);
    const updatedUser = await this.userRepository.updateUser(
      userId,
      validatePayload
    );
    if (!updatedUser) {
      this.logger.error("Failed to update user", { userId });
      throw new InternalServerError("User not updated");
    }
    return updatedUser;
  }

  async resendEmailOtp(email: string) {
    const user = await this.getUserByFilter({ email });
    if (!user) throw new NotFoundError("User not found");

    // generate otp
    const otp = generateOtp();

    await this.otpRepository.saveOtp({
      userId: user.id,
      purpose: OtpPurpose.EMAIL_VERIFICATION,
      otp,
      identifier: user.email ?? null,
      expiresAt: new Date(Date.now() + Number(config.otp.EXPIRE_TIME)),
      metadata: { email: user.email },
    });

    await this.mailService.sendMail(
      user.email,
      "Welcome to CTMS | Please verify your email",
      otpTemplate(otp)
    );

    return user;
  }

  async verifyUserEmail(email: string, otp: string) {
    const user = await this.getUserByFilter({ email });
    if (!user) throw new NotFoundError("User not found");

    const otpRecord = await this.otpRepository.getActiveOtp(
      user.id,
      OtpPurpose.EMAIL_VERIFICATION,
      user.email ?? null
    );

    if (!otpRecord) {
      this.logger.warn("OTP expired for user", { email });
      throw new BadRequestError("OTP has expired");
    }

    if (otpRecord.otp !== otp) throw new UnauthorizedError("Invalid OTP");

    await this.otpRepository.markOtpConsumed(otpRecord.id);
    await this.otpRepository.deleteOtp(user.id, OtpPurpose.EMAIL_VERIFICATION);

    return await this.userRepository.updateUser(user.id, {
      isEmailVerified: true,
      isActive: true,
    });
  }

  async signIn(emailOrPhoneNumber: string, password: string) {
    const validatePlayload = validatePayloadSchema(UserSignInSchema, {
      emailOrPhoneNumber,
      password,
    });

    if (!validatePlayload) throw new NotFoundError("User not found");
    const user = await this.userRepository.getUserByEmailOrPhone(
      validatePlayload.emailOrPhoneNumber
    );

    if (!user) throw new NotFoundError("User not found");

    if (!user.isActive) throw new UnauthorizedError("User is not active");

    if (!user.isEmailVerified)
      throw new UnauthorizedError("User is not verified");

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      this.logger.warn("Invalid password attempt", { userId: user.id });
      throw new UnauthorizedError("Invalid credentials");
    }
    this.logger.info("User signed in successfully", { userId: user.id });

    const refreshToken = await generateRefreshToken(user.id);

    await this.userRepository.updateRefreshToken(user.id, refreshToken);
    return {
      accessToken: await generateAccessToken(user.id),
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    if (!token) throw new UnauthorizedError("Invalid token");
    const decoded = verifyRefreshToken(token);

    if (!decoded) throw new UnauthorizedError("Invalid token");
    return await generateAccessToken(decoded.userId);
  }

  async getUserById(userId: number) {
    if (typeof userId !== "number")
      throw new NotFoundError("Please provide valid id");
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async getAllUsers(
    limit: number,
    page: number,
    filter: UserFilterType
  ): Promise<{ rows: UserResponse[]; count: number }> {
    const validatedFilter = validatePayloadSchema(UserFilterSchema, filter);
    return await this.userRepository.getAllUsers(limit, page, validatedFilter);
  }

  async getUserByFilter(filter: UserFilterType) {
    const validatedFilter = validatePayloadSchema(UserFilterSchema, filter);
    return await this.userRepository.getUserByFilter(validatedFilter);
  }

  async requestForgotPasswordOtp(email: string) {
    const validatedEmail = validatePayloadSchema(UserFilterSchema, { email });

    const user = await this.getUserByFilter(validatedEmail);
    if (!user) throw new NotFoundError("User not found");

    const otp = generateOtp();

    await this.mailService.sendMail(
      user.email,
      "CTMS | OTP for forgot password",
      otpTemplate(otp)
    );

    await this.otpRepository.saveOtp({
      userId: user.id,
      purpose: OtpPurpose.PASSWORD_RESET,
      otp,
      identifier: user.email ?? null,
      expiresAt: new Date(Date.now() + Number(config.otp.EXPIRE_TIME)),
      metadata: { email: user.email },
    });

    return "OTP sent successfully.";
  }

  async verifyForgotPasswordOtp(email: string, otp: string) {
    const validatedEmail = validatePayloadSchema(UserFilterSchema, { email });
    const user = await this.getUserByFilter(validatedEmail);
    if (!user) throw new NotFoundError("User not found");

    const otpRecord = await this.otpRepository.getActiveOtp(
      user.id,
      OtpPurpose.PASSWORD_RESET,
      user.email ?? null
    );
    if (!otpRecord) throw new BadRequestError("OTP has expired");

    if (otpRecord.otp !== otp) throw new UnauthorizedError("Invalid OTP");

    await this.userRepository.updateUser(user.id, {
      isEmailVerified: true,
      isActive: true,
    });

    await this.otpRepository.markOtpConsumed(otpRecord.id);

    return "OTP verified successfully.";
  }

  async resetPassword(payload: ResetPasswordSchema) {
    const validatedEmail = validatePayloadSchema(ResetPasswordSchema, payload);
    const user = await this.getUserByFilter(validatedEmail);
    if (!user) throw new NotFoundError("User not found");

    const otpRecord = await this.otpRepository.getActiveOtp(
      user.id,
      OtpPurpose.PASSWORD_RESET,
      user.email ?? null
    );
    if (!otpRecord) throw new NotFoundError("Password reset link has expired");

    if (otpRecord.otp !== payload.otp)
      throw new UnauthorizedError("Invalid OTP");

    await this.userRepository.updateUser(user.id, {
      password: payload.password,
    });

    await this.otpRepository.markOtpConsumed(otpRecord.id);
    await this.otpRepository.deleteOtp(user.id, OtpPurpose.PASSWORD_RESET);

    return "Password reset successfully";
  }

  async googleAuth(token: string) {
    // get user info from google
    const googleApiRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const googleApiResData = await googleApiRes.json();
    if (googleApiResData.error) throw new NotFoundError("Invalid credentials");

    const { email } = googleApiResData;
    let user;

    // check if user exists
    user = await this.getUserByFilter({ email });

    // if user not found create new user
    if (!user) {
      const newUser = await this.userRepository.createUser({
        email,
        password: "",
        firstName: googleApiResData.given_name,
        lastName: googleApiResData.family_name,
        isActive: true,
        provider: "google",
        profilePicture: googleApiResData.picture,
        isEmailVerified: true,
      });
      user = newUser;
    }

    // if profile picture is not set then update it
    if (!user.profilePicture && googleApiResData.picture) {
      await this.updateUser(user.id, {
        profilePicture: googleApiResData.picture as string,
        isActive: true,
        provider: "google",
      });
    }

    // generate access and refresh token
    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    // update refresh token
    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Updates the refresh token for a user
   * @param userId - The ID of the user
   * @param refreshToken - The new refresh token (or null to clear it)
   */
  async updateRefreshToken(
    userId: number,
    refreshToken: string | null
  ): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, refreshToken);
  }
}
