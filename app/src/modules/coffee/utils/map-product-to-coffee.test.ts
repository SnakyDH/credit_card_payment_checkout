import { mapProductToCoffee } from "@/modules/coffee/utils/map-product-to-coffee";

describe("mapProductToCoffee", () => {
  it("maps API product to coffee model", () => {
    expect(
      mapProductToCoffee({
        id: 7,
        name: "Arabica",
        image: "https://example.com/arabica.jpg",
        price: 12000,
        stock: 10,
      }),
    ).toEqual({
      id: "7",
      name: "Arabica",
      image: "https://example.com/arabica.jpg",
      price: 12000,
      stockAvailable: 10,
    });
  });
});
