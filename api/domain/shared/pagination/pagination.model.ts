export class PaginationModel<T> {
  constructor(
    public readonly items: T[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
    public readonly totalPages: number,
  ) {}

  static create<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginationModel<T> {
    const totalPages = Math.ceil(total / limit);
    return new PaginationModel<T>(items, total, page, limit, totalPages);
  }
}
