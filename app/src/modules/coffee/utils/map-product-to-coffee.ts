import { Coffee } from "@/modules/coffee/model/coffee";
import { ProductResponse } from "@/modules/coffee/types/product-api.types";

export function mapProductToCoffee(product: ProductResponse): Coffee {
  return {
    id: String(product.id),
    name: product.name,
    image: product.image,
    price: product.price,
    stockAvailable: product.stock,
  };
}
