import { z } from "zod";

const uuidSchema = z.string().uuid();

export const isValidUUID = (id: string): boolean => {
  return uuidSchema.safeParse(id).success;
};

type SuccessApiResponse<T = any> = {
  code: number;
  res: Response;
  data: T;
  message?: string;
};

type PaginatedResponse<T = any> = {
  posts: T[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
};

export { SuccessApiResponse, PaginatedResponse };
