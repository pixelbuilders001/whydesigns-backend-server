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
