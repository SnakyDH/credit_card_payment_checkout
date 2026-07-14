export interface Pagination {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
