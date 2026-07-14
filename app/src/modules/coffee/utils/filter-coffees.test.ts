import { filterCoffees } from "@/modules/coffee/utils/filter-coffees";
import { OrderType } from "@/modules/shared/pagination/order-type";

const coffees = [
  { id: "1", name: "Arabica", image: "", price: 10000, stockAvailable: 5 },
  { id: "2", name: "Robusta", image: "", price: 8000, stockAvailable: 10 },
  { id: "3", name: "Latte Blend", image: "", price: 12000, stockAvailable: 2 },
];

describe("filterCoffees", () => {
  it("filters by name", () => {
    const result = filterCoffees(coffees, { name: "latte" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Latte Blend");
  });

  it("filters by price range", () => {
    const result = filterCoffees(coffees, {
      minPrice: 9000,
      maxPrice: 11000,
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Arabica");
  });

  it("filters by stock range", () => {
    const result = filterCoffees(coffees, {
      minStock: 5,
      maxStock: 8,
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Arabica");
  });

  it("sorts strings ascending", () => {
    const result = filterCoffees(coffees, {
      orderBy: { field: "name", order: OrderType.ASC },
    });

    expect(result[0].name).toBe("Arabica");
  });
});
