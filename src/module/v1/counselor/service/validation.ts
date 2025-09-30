import { z } from "zod";

export const CounselorSchema = z.object({
  fullName: z.string().min(2, "Full name must have at least 2 characters"),
  title: z.string().min(2, "Title must have at least 2 characters").optional(),
  yearsOfExperience: z.coerce
    .number()
    .int()
    .min(0, "Experience must be >= 0")
    .max(80, "Experience too high")
    .optional(),
  bio: z.string().max(5000).optional(),
  avatarUrl: z.string().url().optional(),
  specialties: z.array(z.string().min(1)).optional().default([]),
  isActive: z.boolean().optional().default(true),
  rating: z.coerce.number().min(0).max(5).optional(),
});

export const CounselorUpdateSchema = CounselorSchema.partial();

export const CounselorFilterSchema = z.object({
  search: z.string().optional(),
  isActive: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => (typeof v === "string" ? v === "true" : v))
    .optional(),
});

export type CounselorValidation = z.infer<typeof CounselorSchema>;
export type CounselorUpdateValidation = z.infer<typeof CounselorUpdateSchema>;
export type CounselorFilterValidation = z.infer<typeof CounselorFilterSchema>;
