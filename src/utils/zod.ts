import { z } from "zod";
import { ValidationError } from "../error";

export const validatePayloadSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      "Validation Error",
      result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        value: issue.code,
      }))
    );
  }
  return result.data;
};
