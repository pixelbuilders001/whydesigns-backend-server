import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../..";
import User from "../auth/user.model";
import Counselor from "../counselor/counselor.model";

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface BookingAttributes {
  id: number;
  userId: number;
  counselorId: number;
  sessionDate: Date;
  duration: number; // in minutes
  status: BookingStatus;
  notes?: string;
  meetingLink?: string;
  googleEventId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingCreationAttributes
  extends Optional<BookingAttributes, "id" | "status" | "meetingLink" | "googleEventId"> {}

class Booking
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  public id!: number;
  public userId!: number;
  public counselorId!: number;
  public sessionDate!: Date;
  public duration!: number;
  public status!: BookingStatus;
  public notes!: string;
  public meetingLink!: string;
  public googleEventId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
  public readonly counselor?: Counselor;

  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: "id",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      field: "userid",
    },
    counselorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'counselors',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      field: "counselorid",
    },
    sessionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "sessiondate",
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "duration",
      comment: 'Duration in minutes',
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
      field: "status",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "notes",
    },
    meetingLink: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "meetinglink",
    },
    googleEventId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "googleeventid",
      comment: 'Google Calendar event ID for integration',
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
    modelName: "Booking",
    tableName: "bookings",
    timestamps: true,
  }
);

// Define associations
Booking.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
});

Booking.belongsTo(Counselor, {
  foreignKey: 'counselorId',
  as: 'counselor',
  onDelete: 'CASCADE',
});

// Add reverse associations
User.hasMany(Booking, {
  foreignKey: 'userId',
  as: 'bookings',
});

Counselor.hasMany(Booking, {
  foreignKey: 'counselorId',
  as: 'bookings',
});

export default Booking;
