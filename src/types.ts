export interface PaginatedResult<T> {
  count: number;
  data: T[];
  totalPages: number;
  currentPage: number;
}

export interface PaginationFilter {
  skip?: number;
  limit?: number;
  order?: string[];
}

export enum TodoStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}
