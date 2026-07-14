import { mapCoffeeFiltersToApiParams } from "@/modules/coffee/utils/map-coffee-filters-to-api-params";

describe("mapCoffeeFiltersToApiParams", () => {
  it("maps name and order filters", () => {
    const params = mapCoffeeFiltersToApiParams({
      name: " arabica ",
      orderBy: { field: "price", order: "ASC" },
      page: 2,
      limit: 20,
    });

    expect(params).toEqual({
      page: 2,
      limit: 20,
      name: "arabica",
      orderByField: "price",
      orderByType: "ASC",
    });
  });

  it("omits empty name", () => {
    const params = mapCoffeeFiltersToApiParams({ name: "   " });

    expect(params.name).toBeUndefined();
  });
});
