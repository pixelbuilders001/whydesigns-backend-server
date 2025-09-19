import { config } from "../config";

export const generateOtp = (length: number = Number(config.otp.LENGTH)) => {
  const otp = Math.floor(Math.random() * Math.pow(10, length));
  return otp.toString().padStart(length, "0");
};

export const generateRandomPassword = (
  length: number = Number(config.otp.LENGTH)
) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  return password;
};
