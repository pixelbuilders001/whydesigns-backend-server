import { DataTypes, Model, Optional } from "sequelize";
import bcrypt from "bcryptjs";
import Role from "./role.model";
import sequelize from "../..";

// Define the attributes for the User model
interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  roleId: number;
  dateOfBirth?: Date;
  email?: string;
  password: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  address?: string;
  profilePicture?: string;
  isActive: boolean;
  refreshToken?: string | null;
  provider?: "google" | "facebook" | "local";
  createdAt?: Date;
  updatedAt?: Date;
}

// Define optional attributes when creating a user
export interface UserCreationAttributes
  extends Optional<UserAttributes, "id"> {}

// Define the User class extending Sequelize's Model
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public roleId!: number;
  public dateOfBirth!: Date;
  public email!: string;
  public password!: string;
  public phoneNumber!: string;
  public isEmailVerified!: boolean;
  public isPhoneVerified!: boolean;
  public address!: string;
  public profilePicture!: string;
  public isActive!: boolean;
  public refreshToken!: string | null;
  public provider!: "google" | "facebook" | "local";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  toJSON() {
    const values = { ...this.get() };
    delete (values as { password?: string }).password;
    return values;
  }

  // Method to compare passwords
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

// Initialize the User model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    provider: {
      type: DataTypes.ENUM("google", "facebook", "local"),
      defaultValue: "local",
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// Define association
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(User, { foreignKey: "roleId", as: "users" });

export default User;
