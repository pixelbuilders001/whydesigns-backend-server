import { z } from "zod";

export const BookingSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  counselorId: z.number().int().positive("Counselor ID must be a positive integer"),
  sessionDate: z.string().datetime("Invalid session date format. Use ISO 8601 format"),
  duration: z.number().int().min(15, "Session must be at least 15 minutes").max(480, "Session cannot exceed 8 hours"),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional().default('pending'),
});

export const BookingUpdateSchema = z.object({
  sessionDate: z.string().datetime("Invalid session date format. Use ISO 8601 format").optional(),
  duration: z.number().int().min(15, "Session must be at least 15 minutes").max(480, "Session cannot exceed 8 hours").optional(),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional().or(z.literal("")),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  meetingLink: z.string().url("Invalid meeting link URL").optional().or(z.literal("")),
  googleEventId: z.string().max(255, "Google Event ID cannot exceed 255 characters").optional().or(z.literal("")),
});

export const BookingFilterSchema = z.object({
  userId: z.number().int().positive().optional(),
  counselorId: z.number().int().positive().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type BookingValidation = z.infer<typeof BookingSchema>;
export type BookingUpdateValidation = z.infer<typeof BookingUpdateSchema>;
export type BookingFilterValidation = z.infer<typeof BookingFilterSchema>;
