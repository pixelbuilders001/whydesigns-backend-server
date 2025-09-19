import { z } from "zod";

export const RoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

export const RoleUpdateSchema = RoleSchema.partial();

export type RoleValidationSchema = z.infer<typeof RoleSchema>;
export type RoleUpdateValidationSchema = z.infer<typeof RoleUpdateSchema>;
