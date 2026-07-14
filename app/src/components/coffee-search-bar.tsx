import { CoffeePalette, Spacing } from "@/constants/theme";
import { CoffeeOrderBy } from "@/modules/coffee/model/coffee-search-filters";
import { OrderType } from "@/modules/shared/pagination/order-type";
import { Image } from "expo-image";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "./themed-text";

interface SortOption {
  label: string;
  value: CoffeeOrderBy;
}

const SORT_OPTIONS: SortOption[] = [
  { label: "Nombre A-Z", value: { field: "name", order: OrderType.ASC } },
  { label: "Precio ↑", value: { field: "price", order: OrderType.ASC } },
  { label: "Precio ↓", value: { field: "price", order: OrderType.DESC } },
  {
    label: "Stock ↑",
    value: { field: "stockAvailable", order: OrderType.ASC },
  },
  {
    label: "Stock ↓",
    value: { field: "stockAvailable", order: OrderType.DESC },
  },
];

function isSameOrderBy(a?: CoffeeOrderBy, b?: CoffeeOrderBy): boolean {
  if (!a || !b) return false;
  return a.field === b.field && a.order === b.order;
}

interface CoffeeSearchBarProps {
  search: string;
  onChangeSearch: (value: string) => void;
  orderBy?: CoffeeOrderBy;
  onChangeOrderBy: (value: CoffeeOrderBy | undefined) => void;
}

export function CoffeeSearchBar({
  search,
  onChangeSearch,
  orderBy,
  onChangeOrderBy,
}: CoffeeSearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Image
          source={require("@/assets/icon/search-icon.png")}
          style={styles.searchIcon}
          contentFit="contain"
        />
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={onChangeSearch}
          placeholder="Buscar café por nombre..."
          placeholderTextColor={CoffeePalette.mutedText}
        />
      </View>
      <View style={styles.chipsRow}>
        {SORT_OPTIONS.map((option) => {
          const isActive = isSameOrderBy(orderBy, option.value);
          return (
            <Pressable
              key={option.label}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() =>
                onChangeOrderBy(isActive ? undefined : option.value)
              }
            >
              <ThemedText
                type="small"
                style={[styles.chipText, isActive && styles.chipTextActive]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: CoffeePalette.warmWhite,
    borderWidth: 1,
    borderColor: CoffeePalette.beige,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.two,
    fontSize: 16,
    color: CoffeePalette.charcoal,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginLeft: Spacing.two,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
    backgroundColor: CoffeePalette.beige,
  },
  chipActive: {
    backgroundColor: CoffeePalette.forest,
  },
  chipText: {
    color: CoffeePalette.charcoal,
  },
  chipTextActive: {
    color: CoffeePalette.warmWhite,
  },
});
