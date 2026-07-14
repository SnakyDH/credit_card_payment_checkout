import { CoffeeOrderBy } from "@/modules/coffee/model/coffee-search-filters";
import { GetProductsParams } from "@/modules/coffee/types/product-api.types";

const ORDER_BY_FIELD_MAP: Record<
  CoffeeOrderBy["field"],
  GetProductsParams["orderByField"]
> = {
  id: "id",
  name: "name",
  image: "image",
  price: "price",
  stockAvailable: "stock",
};

export interface CoffeeProductsQuery {
  name?: string;
  orderBy?: CoffeeOrderBy;
  page?: number;
  limit?: number;
}

export function mapCoffeeFiltersToApiParams(
  filters: CoffeeProductsQuery,
): GetProductsParams {
  const params: GetProductsParams = {
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.name?.trim()) {
    params.name = filters.name.trim();
  }

  if (filters.orderBy) {
    params.orderByField = ORDER_BY_FIELD_MAP[filters.orderBy.field];
    params.orderByType = filters.orderBy.order;
  }

  return params;
}
