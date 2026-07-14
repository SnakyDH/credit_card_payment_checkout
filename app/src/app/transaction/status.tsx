import { SymbolView } from "expo-symbols";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ScreenContent } from "@/components/screen-content";
import { CoffeePalette, Spacing } from "@/constants/theme";
import { CurrencyFormatter } from "@/formatters/currency-formatter";
import { resetTransaction } from "@/modules/transaction/store/transaction.slice";
import { TransactionStatus } from "@/modules/transaction/types/transaction-api.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function formatTransactionStatus(status: string): string {
  switch (status) {
    case TransactionStatus.APPROVED:
      return "Aprobado";
    case TransactionStatus.PENDING:
      return "Pendiente";
    case TransactionStatus.REJECTED:
      return "Rechazado";
    default:
      return status;
  }
}

function isApprovedStatus(status: string): boolean {
  return status === TransactionStatus.APPROVED;
}

function isRejectedStatus(status: string): boolean {
  return status === TransactionStatus.REJECTED;
}

export default function TransactionStatusScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const result = useAppSelector((state) => state.transaction.result);

  useEffect(() => {
    if (!result) {
      router.replace("/");
    }
  }, [result, router]);

  if (!result) {
    return null;
  }

  const approved = isApprovedStatus(result.status);
  const rejected = isRejectedStatus(result.status);
  const subtotal = result.total - result.deliveryFee;

  const handleGoHome = () => {
    dispatch(resetTransaction());
    router.replace("/");
  };

  return (
    <ThemedView style={styles.outer}>
      <ScreenContent>
        <ThemedView
          style={[
            styles.container,
            {
              paddingTop: insets.top + Spacing.three,
              paddingBottom: Math.max(insets.bottom, Spacing.three),
            },
          ]}
        >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View
            style={[
              styles.iconCircle,
              approved
                ? styles.iconCircleApproved
                : rejected
                  ? styles.iconCircleRejected
                  : styles.iconCirclePending,
            ]}
          >
            <SymbolView
              name={{
                ios: approved ? "checkmark" : rejected ? "xmark" : "clock.fill",
                android: approved ? "check" : rejected ? "close" : "schedule",
                web: approved ? "check" : rejected ? "close" : "schedule",
              }}
              size={44}
              tintColor={CoffeePalette.warmWhite}
            />
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            {approved
              ? "Pago completado"
              : rejected
                ? "Pago rechazado"
                : "Pago en proceso"}
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            {approved
              ? "Tu pedido fue procesado correctamente"
              : rejected
                ? "Tu pago no pudo ser procesado. Verifica los datos de tu tarjeta e intenta de nuevo."
                : "Estamos confirmando tu transacción"}
          </ThemedText>
        </View>

        <View style={styles.receipt}>
          <ThemedText type="default" style={styles.receiptHeading}>
            Resumen del pedido
          </ThemedText>

          <View style={styles.receiptRow}>
            <ThemedText type="small" style={styles.receiptLabel}>
              Producto
            </ThemedText>
            <ThemedText
              type="small"
              style={styles.receiptValue}
              numberOfLines={2}
            >
              {result.product.name}
            </ThemedText>
          </View>

          <View style={styles.receiptRow}>
            <ThemedText type="small" style={styles.receiptLabel}>
              Cantidad
            </ThemedText>
            <ThemedText type="small" style={styles.receiptValue}>
              {result.product.quantity}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptRow}>
            <ThemedText type="small" style={styles.receiptLabel}>
              Subtotal
            </ThemedText>
            <ThemedText type="small" style={styles.receiptValue}>
              {CurrencyFormatter.format(subtotal)}
            </ThemedText>
          </View>

          <View style={styles.receiptRow}>
            <ThemedText type="small" style={styles.receiptLabel}>
              Envío
            </ThemedText>
            <ThemedText type="small" style={styles.receiptValue}>
              {CurrencyFormatter.format(result.deliveryFee)}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptRow}>
            <ThemedText type="default" style={styles.totalLabel}>
              Total pagado
            </ThemedText>
            <ThemedText type="subtitle" style={styles.totalValue}>
              {CurrencyFormatter.format(result.total)}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptRow}>
            <ThemedText type="small" style={styles.receiptLabel}>
              Estado
            </ThemedText>
            <View
              style={[
                styles.statusBadge,
                approved && styles.statusBadgeApproved,
                result.status === TransactionStatus.REJECTED &&
                  styles.statusBadgeRejected,
              ]}
            >
              <ThemedText
                type="small"
                style={[
                  styles.statusText,
                  !approved &&
                    result.status !== TransactionStatus.REJECTED &&
                    styles.statusTextMuted,
                ]}
              >
                {formatTransactionStatus(result.status)}
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      <Pressable style={styles.homeButton} onPress={handleGoHome}>
        <ThemedText type="default" style={styles.homeButtonText}>
          Volver al inicio
        </ThemedText>
      </Pressable>
        </ThemedView>
      </ScreenContent>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: CoffeePalette.cream,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  scrollContent: {
    flexGrow: 1,
    gap: Spacing.four,
    paddingVertical: Spacing.five,
  },
  hero: {
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
    shadowColor: CoffeePalette.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  iconCircleApproved: {
    backgroundColor: CoffeePalette.forest,
  },
  iconCirclePending: {
    backgroundColor: CoffeePalette.gold,
  },
  iconCircleRejected: {
    backgroundColor: CoffeePalette.velvet,
  },
  title: {
    color: CoffeePalette.forest,
    textAlign: "center",
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    color: CoffeePalette.mutedText,
    textAlign: "center",
  },
  receipt: {
    width: "100%",
    backgroundColor: CoffeePalette.warmWhite,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: CoffeePalette.beige,
    shadowColor: CoffeePalette.forest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  receiptHeading: {
    color: CoffeePalette.forest,
    fontWeight: "700",
  },
  receiptRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  receiptLabel: {
    color: CoffeePalette.mutedText,
    flex: 1,
  },
  receiptValue: {
    color: CoffeePalette.charcoal,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: CoffeePalette.beige,
  },
  totalLabel: {
    color: CoffeePalette.forest,
    fontWeight: "700",
  },
  totalValue: {
    color: CoffeePalette.coffee,
    fontSize: 24,
    lineHeight: 30,
  },
  statusBadge: {
    backgroundColor: CoffeePalette.beige,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
  },
  statusBadgeApproved: {
    backgroundColor: CoffeePalette.forest,
  },
  statusBadgeRejected: {
    backgroundColor: CoffeePalette.velvet,
  },
  statusText: {
    color: CoffeePalette.warmWhite,
    fontWeight: "700",
  },
  statusTextMuted: {
    color: CoffeePalette.forest,
  },
  homeButton: {
    backgroundColor: CoffeePalette.forest,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: "center",
    marginTop: Spacing.three,
  },
  homeButtonText: {
    color: CoffeePalette.warmWhite,
    fontWeight: "bold",
  },
});
