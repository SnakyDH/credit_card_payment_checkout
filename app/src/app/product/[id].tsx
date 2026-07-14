import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";

import { BottomSheet } from "@/components/bottom-sheet";
import { PresignedCheckout } from "@/components/presigned-checkout";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CoffeePalette, Spacing } from "@/constants/theme";
import { CurrencyFormatter } from "@/formatters/currency-formatter";
import { useAppSelector } from "@/store/hooks";

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const productId = Array.isArray(id) ? id[0] : id;
  const coffee = useAppSelector((state) =>
    state.products.items.find((item) => item.id === productId),
  );

  const [quantity, setQuantity] = useState(1);
  const [sheetVisible, setSheetVisible] = useState(false);

  if (!coffee) {
    return (
      <ThemedView style={styles.notFoundContainer}>
        <ThemedText type="title" style={styles.notFoundTitle}>
          Producto no encontrado
        </ThemedText>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ThemedText type="small" style={styles.backButtonText}>
            Volver
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const total = coffee.price * quantity;
  const canDecrease = quantity > 1;
  const canIncrease = quantity < coffee.stockAvailable;
  const canPurchase = coffee.stockAvailable > 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.three },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <ThemedText type="small" style={styles.backLinkText}>
            ← Volver
          </ThemedText>
        </Pressable>

        <Image
          source={{ uri: coffee.image }}
          contentFit="cover"
          style={styles.image}
        />

        <ThemedText type="title" style={styles.name}>
          {coffee.name}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.price}>
          {CurrencyFormatter.format(coffee.price)}
        </ThemedText>
        <ThemedText type="small" style={styles.stock}>
          {coffee.stockAvailable} unidades disponibles
        </ThemedText>

        <View style={styles.quantitySection}>
          <ThemedText type="default" style={styles.quantityLabel}>
            Cantidad
          </ThemedText>
          <View style={styles.quantityControls}>
            <Pressable
              style={[
                styles.quantityButton,
                !canDecrease && styles.quantityButtonDisabled,
              ]}
              onPress={() => canDecrease && setQuantity((q) => q - 1)}
              disabled={!canDecrease}
            >
              <ThemedText type="title" style={styles.quantityButtonText}>
                −
              </ThemedText>
            </Pressable>
            <ThemedText type="title" style={styles.quantityValue}>
              {quantity}
            </ThemedText>
            <Pressable
              style={[
                styles.quantityButton,
                !canIncrease && styles.quantityButtonDisabled,
              ]}
              onPress={() => canIncrease && setQuantity((q) => q + 1)}
              disabled={!canIncrease}
            >
              <ThemedText type="title" style={styles.quantityButtonText}>
                +
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, Spacing.three) },
        ]}
      >
        <Pressable
          style={[styles.actionButton, !canPurchase && styles.actionButtonDisabled]}
          onPress={() => canPurchase && setSheetVisible(true)}
          disabled={!canPurchase}
        >
          <ThemedText type="default" style={styles.actionButtonText}>
            {canPurchase
              ? `Comprar · ${CurrencyFormatter.format(total)}`
              : "Agotado"}
          </ThemedText>
        </Pressable>
      </View>

      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      >
        <PresignedCheckout
          active={sheetVisible}
          productId={coffee.id}
          quantity={quantity}
          productName={coffee.name}
          unitPrice={coffee.price}
          onCloseCheckout={() => {
            setSheetVisible(false);
          }}
        />
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CoffeePalette.cream,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    backgroundColor: CoffeePalette.cream,
    gap: Spacing.three,
  },
  notFoundTitle: {
    color: CoffeePalette.forest,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: CoffeePalette.forest,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  backButtonText: {
    color: CoffeePalette.warmWhite,
  },
  backLink: {
    marginBottom: Spacing.three,
  },
  backLinkText: {
    color: CoffeePalette.forest,
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 280,
    borderRadius: Spacing.four,
    marginBottom: Spacing.four,
  },
  name: {
    color: CoffeePalette.forest,
    marginBottom: Spacing.two,
  },
  price: {
    color: CoffeePalette.coffee,
    marginBottom: Spacing.one,
  },
  stock: {
    color: CoffeePalette.mutedText,
    marginBottom: Spacing.four,
  },
  quantitySection: {
    backgroundColor: CoffeePalette.warmWhite,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  quantityLabel: {
    color: CoffeePalette.forest,
    fontWeight: "600",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: Spacing.four,
    backgroundColor: CoffeePalette.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityButtonText: {
    color: CoffeePalette.warmWhite,
    lineHeight: 32,
  },
  quantityValue: {
    color: CoffeePalette.forest,
    minWidth: 40,
    textAlign: "center",
  },
  bottomBar: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    backgroundColor: CoffeePalette.warmWhite,
    borderTopWidth: 1,
    borderTopColor: CoffeePalette.beige,
  },
  actionButton: {
    backgroundColor: CoffeePalette.forest,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonText: {
    color: CoffeePalette.warmWhite,
    fontWeight: "bold",
    fontSize: 16,
  },
});
