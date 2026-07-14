import { Coffee } from "@/modules/coffee/model/coffee";
import { CoffeeSearchFilters } from "@/modules/coffee/model/coffee-search-filters";
import { OrderType } from "@/modules/shared/pagination/order-type";

export function filterCoffees(
  coffees: Coffee[],
  filters: CoffeeSearchFilters,
): Coffee[] {
  let result = [...coffees];

  if (filters.name?.trim()) {
    const query = filters.name.trim().toLowerCase();
    result = result.filter((coffee) =>
      coffee.name.toLowerCase().includes(query),
    );
  }

  if (filters.minPrice !== undefined) {
    result = result.filter((coffee) => coffee.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter((coffee) => coffee.price <= filters.maxPrice!);
  }

  if (filters.minStock !== undefined) {
    result = result.filter(
      (coffee) => coffee.stockAvailable >= filters.minStock!,
    );
  }

  if (filters.maxStock !== undefined) {
    result = result.filter(
      (coffee) => coffee.stockAvailable <= filters.maxStock!,
    );
  }

  if (filters.orderBy) {
    const { field, order } = filters.orderBy;
    result.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return order === OrderType.DESC ? -comparison : comparison;
    });
  }

  return result;
}
