import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../..";

interface CounselorAttributes {
  id: number;
  fullName: string;
  title?: string;
  yearsOfExperience?: number;
  bio?: string;
  avatarUrl?: string;
  specialties?: string[]; // tags like Portfolio Review, Career Guidance
  isActive: boolean;
  rating?: number; // average rating 0-5
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CounselorCreationAttributes
  extends Optional<CounselorAttributes, "id" | "isActive"> {}

class Counselor
  extends Model<CounselorAttributes, CounselorCreationAttributes>
  implements CounselorAttributes
{
  public id!: number;
  public fullName!: string;
  public title!: string;
  public yearsOfExperience!: number;
  public bio!: string;
  public avatarUrl!: string;
  public specialties!: string[];
  public isActive!: boolean;
  public rating!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Counselor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: "id",
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "fullname",
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: "title",
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "yearsofexperience",
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "bio",
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "avatarurl",
    },
    specialties: {
      // store as JSON array of strings
      type: DataTypes.JSONB,
      allowNull: true,
      field: "specialties",
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "isactive",
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      field: "rating",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "createdat",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updatedat",
    },
  },
  {
    sequelize,
    modelName: "Counselor",
    tableName: "counselors",
    timestamps: true,
  }
);

export default Counselor;
