import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.header("Authorization");
  const bearerToken = authHeader && authHeader.split(" ")[1];
  const cookieToken = (req as any).cookies?.accessToken as string | undefined;
  const token = bearerToken || cookieToken;

  if (!token) {
    res.status(401).json({ message: "Access Denied. No token provided." });
    return;
  }

  try {
    const decodedUser = verifyAccessToken(token);
    (req as any).userId = decodedUser.userId;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}
