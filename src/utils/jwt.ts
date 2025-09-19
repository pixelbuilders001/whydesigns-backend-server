import jwt from "jsonwebtoken";
import { config } from "../config";

interface TokenPayload {
  userId: string;
}

export async function generateAccessToken(userId: string): Promise<string> {
  const payload = {
    userId: userId,
  };
  const secretKey = config.auth.JWT_ACCESS_SECRET;

  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const payload = {
    userId: userId,
  };
  const secretKey = config.auth.JWT_REFRESH_SECRET;

  return jwt.sign(payload, secretKey, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): TokenPayload {
  const decodedToken = jwt.verify(
    token,
    config.auth.JWT_ACCESS_SECRET
  ) as TokenPayload;

  return decodedToken;
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decodedToken = jwt.verify(
      token,
      config.auth.JWT_REFRESH_SECRET
    ) as TokenPayload;
    return decodedToken;
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    return null;
  }
}
