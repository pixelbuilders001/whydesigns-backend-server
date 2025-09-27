import Otp, { OtpPurpose, OtpCreationAttributes } from "../../../../../db/models/auth/otp.model";

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
    const [record, isNew] = await Otp.findOrCreate({
      where: { userId, purpose },
      defaults: {
        userId,
        purpose,
        otp,
        identifier,
        expiresAt,
        consumedAt: null,
        metadata,
      } as OtpCreationAttributes,
    });

    if (!isNew) {
      record.set({ otp, identifier, expiresAt, consumedAt: null, metadata });
      await record.save();
    }

    return record;
  }

  async getActiveOtp(
    userId: number,
    purpose: OtpPurpose,
    identifier: string | null = null
  ): Promise<Otp | null> {
    const otpRecord = await Otp.findOne({
      where: { userId, purpose },
    });

    if (!otpRecord) return null;

    if (identifier && otpRecord.identifier && otpRecord.identifier !== identifier) {
      return null;
    }

    if (otpRecord.consumedAt) return null;

    if (otpRecord.expiresAt < new Date()) return null;

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
