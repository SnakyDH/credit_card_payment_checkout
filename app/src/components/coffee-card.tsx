import { CoffeePalette, Spacing } from "@/constants/theme";
import { Coffee } from "@/modules/coffee/model/coffee";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { CurrencyFormatter } from "@/formatters/currency-formatter";

interface CoffeeCardProps {
  coffee: Coffee;
}

export function CoffeeCard({ coffee }: CoffeeCardProps) {
  return (
    <Link
      href={{
        pathname: "/product/[id]",
        params: { id: coffee.id },
      }}
      asChild
    >
      <TouchableOpacity style={styles.touchable} activeOpacity={0.85}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.badge}>
            <ThemedText type="small" style={styles.badgeText}>
              {coffee.stockAvailable}
            </ThemedText>
          </ThemedView>
          <ThemedView>
            <Image
              source={{ uri: coffee.image }}
              contentFit="cover"
              style={styles.image}
            />
          </ThemedView>
          <ThemedView style={styles.content}>
            <ThemedText type="default" style={styles.title}>
              {coffee.name}
            </ThemedText>
            <ThemedText type="small" style={styles.price}>
              {CurrencyFormatter.format(coffee.price)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: "100%",
  },
  container: {
    borderRadius: Spacing.four,
    overflow: "hidden",
    backgroundColor: CoffeePalette.warmWhite,
    shadowColor: CoffeePalette.forest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badge: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: CoffeePalette.forest,
    borderColor: CoffeePalette.cream,
    borderWidth: 2,
    padding: Spacing.two,
    borderRadius: 50,
  },
  badgeText: {
    color: CoffeePalette.cream,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 150,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: CoffeePalette.cream,
    gap: Spacing.two,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: CoffeePalette.black,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: CoffeePalette.black,
  },
});
