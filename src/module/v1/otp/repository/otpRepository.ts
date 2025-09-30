import Otp, { OtpPurpose } from "../../../../../db/models/auth/otp.model";
import { Op, literal } from "sequelize";
import { config } from "../../../../config";

export { OtpPurpose } from "../../../../../db/models/auth/otp.model";

export interface SaveOtpPayload {
  userId: number;
  purpose: OtpPurpose;
  otp: string;
  identifier?: string | null;
  expiresAt: Date;
  metadata?: Record<string, any> | null;
}

export interface IOtpRepository {
  saveOtp(payload: SaveOtpPayload): Promise<Otp>;
  getActiveOtp(
    userId: number,
    purpose: OtpPurpose,
    identifier?: string | null
  ): Promise<Otp | null>;
  markOtpConsumed(id: number): Promise<void>;
  deleteOtp(userId: number, purpose: OtpPurpose): Promise<void>;
}

class OtpRepository implements IOtpRepository {
  async saveOtp({
    userId,
    purpose,
    otp,
    identifier = null,
    expiresAt,
    metadata = null,
  }: SaveOtpPayload): Promise<Otp> {
    const normalizedIdentifier = identifier
      ? String(identifier).trim().toLowerCase()
      : null;
    // Compute expiry using DB time to avoid any clock skew
    const expireSeconds = Math.floor(Number(config.otp.EXPIRE_TIME) / 1000);

    // Upsert atomically based on unique (userId, purpose)
    await Otp.upsert({
      userId,
      purpose,
      otp,
      identifier: normalizedIdentifier,
      consumedAt: null,
      metadata,
      // Use DB literal for expiresAt
      expiresAt: literal(`NOW() + INTERVAL '${expireSeconds} seconds'`) as any,
    } as any);

    // Refetch the latest record to return consistent data
    const fresh = await Otp.findOne({
      where: { userId, purpose },
      order: [["updatedAt", "DESC"]],
    });

    if (!fresh) throw new Error("Failed to upsert OTP");
    return fresh;
  }

  async getActiveOtp(
    userId: number,
    purpose: OtpPurpose,
    identifier: string | null = null
  ): Promise<Otp | null> {
    const baseWhere: any = {
      userId,
      purpose,
      consumedAt: { [Op.is]: null },
    };

    if (identifier) {
      const normalized = String(identifier).trim().toLowerCase();
      baseWhere.identifier = normalized;
    }

    const otpRecord = await Otp.findOne({
      where: {
        ...baseWhere,
        [Op.and]: [literal('"expiresat" > NOW()')],
      },
      order: [["updatedAt", "DESC"]],
    });

    if (!otpRecord) return null;

    if (otpRecord.consumedAt) return null;

    return otpRecord;
  }

  async markOtpConsumed(id: number): Promise<void> {
    const record = await Otp.findByPk(id);
    if (!record) return;

    record.set({ consumedAt: new Date() });
    await record.save();
  }

  async deleteOtp(userId: number, purpose: OtpPurpose): Promise<void> {
    await Otp.destroy({ where: { userId, purpose } });
  }
}

export const otpRepository = new OtpRepository();

export default OtpRepository;
