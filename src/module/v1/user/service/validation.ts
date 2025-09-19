import { z } from "zod";
import { config } from "../../../../config";

export const userSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must have at least 2 characters")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must have at least 2 characters")
    .optional(),
  dateOfBirth: z.coerce.date().optional(),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional()
    .or(z.literal("")),
  phoneNumber: z
    .string()
    .regex(/^\d{10,15}$/, "Invalid phone number format")
    .optional(),
  address: z
    .string()
    .max(200, "Address cannot exceed 200 characters")
    .optional(),
  profilePicture: z.string().url("Invalid profile picture URL").optional(),
  isActive: z.boolean().default(false),
  isEmailVerified: z.boolean().default(false).optional(),
  provider: z.enum(["google", "facebook", "local"]).optional().default("local"),
});

export const userUpdateSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must have at least 2 characters")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must have at least 2 characters")
    .optional(),
  dateOfBirth: z.coerce.date().optional(),
  address: z
    .string()
    .max(200, "Address cannot exceed 200 characters")
    .optional(),
  profilePicture: z.string().url("Invalid profile picture URL").optional(),
});

export const UserSignInSchema = z.object({
  emailOrPhoneNumber: z.string().refine(
    (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{10}$/;

      return emailRegex.test(value) || phoneRegex.test(value);
    },
    {
      message: "Must be a valid email or phone number",
    }
  ),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const UserFilterSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  phoneNumber: z
    .string()
    .regex(/^\d{10,15}$/, "Invalid phone number format")
    .optional(),
  firstName: z
    .string()
    .min(2, "First name must have at least 2 characters")
    .optional(),
  isActive: z.boolean().optional(),
  roleId: z.string().uuid().optional(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  otp: z
    .string()
    .min(
      config.otp.LENGTH as number,
      `OTP must be at least ${config.otp.LENGTH} characters long`
    ),
});

export type UserFilterType = z.infer<typeof UserFilterSchema>;
export type UserPayloadType = z.infer<typeof userSchema>;
export type UserSignInValidationSchema = z.infer<typeof UserSignInSchema>;
export type ResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;
export type UserUpdateType = z.infer<typeof userUpdateSchema>
