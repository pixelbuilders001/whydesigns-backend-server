import { Op } from "sequelize";
import {
  UserFilterType,
  UserPayloadType,
  UserUpdateType,
} from "../service/validation";
import { UserResponse } from "../type";
import User from "../../../../../db/models/auth/user.model";

export interface IUserRepository {
  createUser(user: any): Promise<UserResponse>;
  getUserById(userId: number): Promise<UserResponse | null>;
  getAllUsers(
    limit: number,
    page: number,
    filter: UserFilterType
  ): Promise<{ rows: UserResponse[]; count: number }>;
  updateUser(userId: number, user: any): Promise<any>;
  getUserByFilter(filters: Partial<UserPayloadType>): Promise<UserResponse | null>;
  updateRefreshToken(userId: number, refreshToken: string | null): Promise<any>;
  getUserByEmailOrPhone(
    emailOrPhoneNumber: UserPayloadType["email" | "phoneNumber"]
  ): Promise<any>;
}

export default class UserRepository implements IUserRepository {
  async createUser(user: any): Promise<any> {
    return await User.create(user);
  }

  async getUserById(userId: number): Promise<UserResponse | null> {
    return await User.findByPk(userId, {
      attributes: {
        exclude: ["password", "refreshToken"],
      },
    });
  }

  async getAllUsers(
    limit: number,
    page: number,
    filter: UserFilterType
  ): Promise<{ rows: UserResponse[]; count: number }> {
    const whereClause: any = { ...filter };

    if (filter?.firstName) {
      whereClause.firstName = {
        [Op.iLike]: `%${filter.firstName}%`,
      };
    }

    if (filter?.gender) {
      whereClause.gender = filter.gender;
    }

    const { rows, count } = await User.findAndCountAll({
      limit,
      offset: (page - 1) * limit,
      where: whereClause,
      attributes: {
        exclude: ["password", "refreshToken"],
      },
      raw: true,
      nest: true,
    });

    return { rows: rows as unknown as UserResponse[], count };
  }

  async getUserByFilter(filters: Partial<UserPayloadType>): Promise<UserResponse | null> {
    return await User.findOne({ where: filters });
  }

  async updateUser(userId: number, payload: UserUpdateType): Promise<any> {
    return await User.update(payload, {
      where: { id: userId },
      returning: true,
      individualHooks: true,
    });
  }

  async getUserByEmailOrPhone(
    emailOrPhoneNumber: UserPayloadType["email" | "phoneNumber"]
  ) {
    return await User.findOne({
      where: {
        [Op.or]: [
          { email: emailOrPhoneNumber },
          { phoneNumber: emailOrPhoneNumber },
        ],
      },
    });
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string | null
  ): Promise<any> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    await user.update({ refreshToken });
    return user;
  }
}

export const userRepository = new UserRepository();
