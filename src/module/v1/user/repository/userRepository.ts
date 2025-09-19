import { Op } from "sequelize";
import { generateAccessToken } from "../../../../utils/jwt";
import {
  UserFilterType,
  UserPayloadType,
  UserUpdateType,
} from "../service/validation";
import { UserResponse } from "../type";
import User from "../../../../../db/models/auth/user.model";

export interface IUserRepository {
  createUser(user: any): Promise<UserResponse>;
  getUserById(userId: string): Promise<any>;
  getAllUsers(
    limit: number,
    page: number,
    filter: UserFilterType
  ): Promise<{ rows: UserResponse[]; count: number }>;
  updateUser(userId: string, user: any): Promise<any>;
  getUserByFilter(filters: Partial<UserPayloadType>): Promise<any>;
  updateRefreshToken(userId: string, refreshToken: string | null): Promise<any>;
  getUserByEmailOrPhone(
    emailOrPhoneNumber: UserPayloadType["email" | "phoneNumber"]
  ): Promise<any>;
}

export default class UserRepository implements IUserRepository {
  async createUser(user: any): Promise<any> {
    return await User.create(user);
  }

  async getUserById(userId: string): Promise<any> {
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

    // Convert id to string to match UserResponse type
    const formattedRows = rows.map((user) => ({
      ...user,
      id: user.id.toString(),
    }));

    return { rows: formattedRows, count };
  }

  async getUserByFilter(filters: Partial<UserPayloadType>): Promise<any> {
    return await User.findOne({ where: filters });
  }

  async updateUser(userId: string, payload: UserUpdateType): Promise<any> {
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
    userId: string,
    refreshToken: string | null
  ): Promise<any> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    await user.update({ refreshToken });
    return user;
  }
}

export const userRepository = new UserRepository();
