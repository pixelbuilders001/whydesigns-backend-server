import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../..";

export enum OtpPurpose {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
}

interface OtpAttributes {
  id: number;
  userId: number;
  purpose: OtpPurpose;
  identifier?: string | null;
  otp: string;
  expiresAt: Date;
  consumedAt?: Date | null;
  metadata?: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OtpCreationAttributes
  extends Optional<
    OtpAttributes,
    "id" | "consumedAt" | "metadata" | "identifier" | "createdAt" | "updatedAt"
  > {}

class Otp
  extends Model<OtpAttributes, OtpCreationAttributes>
  implements OtpAttributes
{
  public id!: number;
  public userId!: number;
  public purpose!: OtpPurpose;
  public identifier!: string | null;
  public otp!: string;
  public expiresAt!: Date;
  public consumedAt!: Date | null;
  public metadata!: Record<string, any> | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Otp.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "userid",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    purpose: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    identifier: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expiresat",
    },
    consumedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "consumedat",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
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
    tableName: "otps",
    modelName: "Otp",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userid", "purpose"],
        name: "otps_userid_purpose_unique",
      },
      {
        fields: ["purpose"],
        name: "otps_purpose_idx",
      },
      {
        fields: ["expiresat"],
        name: "otps_expiresat_idx",
      },
    ],
  }
);

export default Otp;
