import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { Checkbox } from "@/components/checkbox";
import { CreditCardForm } from "@/components/credit-card-form";
import { ThemedText } from "@/components/themed-text";
import { CoffeePalette, Spacing } from "@/constants/theme";
import { fetchPresigned } from "@/modules/presigned/store/presigned.thunk";
import {
  PresignedResponse,
  PresignedType,
} from "@/modules/presigned/types/presigned-api.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface PresignedCheckoutProps {
  active: boolean;
  productId: string;
  quantity: number;
  productName: string;
  unitPrice: number;
  onCloseCheckout?: () => void;
}

const PRESIGNED_LABELS: Record<PresignedType, string> = {
  [PresignedType.PERSONAL_DATA_AUTH]:
    "Autorizo el tratamiento de mis datos personales",
  [PresignedType.END_USER_POLICY]: "Acepto la política de usuario final",
};

function getPresignedLabel(doc: PresignedResponse): string {
  return PRESIGNED_LABELS[doc.type] ?? doc.type;
}

export function PresignedCheckout({
  active,
  productId,
  quantity,
  productName,
  unitPrice,
  onCloseCheckout,
}: PresignedCheckoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, status, error } = useAppSelector((state) => state.presigned);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [payVisible, setPayVisible] = useState(false);

  const loadPresigned = useCallback(() => {
    dispatch(fetchPresigned());
  }, [dispatch]);

  useEffect(() => {
    if (active) {
      setAccepted({});
      setPayVisible(false);
      loadPresigned();
    }
  }, [active, loadPresigned]);

  const toggleAccepted = (token: string) => {
    setAccepted((prev) => ({ ...prev, [token]: !prev[token] }));
  };

  const allAccepted =
    items.length > 0 && items.every((doc) => accepted[doc.token]);

  const presignedDocuments = useMemo(
    () => items.filter((doc) => accepted[doc.token]),
    [items, accepted],
  );

  return (
    <View style={styles.container}>
      <ThemedText type="default" style={styles.title}>
        Documentos requeridos
      </ThemedText>

      {status === "loading" || status === "idle" ? (
        <View style={styles.centered}>
          <ActivityIndicator color={CoffeePalette.forest} />
        </View>
      ) : status === "failed" ? (
        <View style={styles.centered}>
          <ThemedText type="small" style={styles.errorText}>
            {error ?? "No se pudieron cargar los documentos"}
          </ThemedText>
          <Pressable style={styles.retryButton} onPress={loadPresigned}>
            <ThemedText type="small" style={styles.retryText}>
              Reintentar
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.checkboxList}>
          {items.map((doc) => (
            <Checkbox
              key={doc.token}
              checked={!!accepted[doc.token]}
              onToggle={() => toggleAccepted(doc.token)}
              label={getPresignedLabel(doc)}
            />
          ))}
        </View>
      )}

      <Pressable
        style={[styles.payButton, !allAccepted && styles.payButtonDisabled]}
        onPress={() => setPayVisible(true)}
        disabled={!allAccepted}
      >
        <ThemedText type="default" style={styles.payButtonText}>
          Pagar con tarjeta de crédito
        </ThemedText>
      </Pressable>

      <BottomSheet
        visible={payVisible}
        onClose={() => {
          setPayVisible(false);
          onCloseCheckout?.();
        }}
        fullScreen
      >
        <CreditCardForm
          key={payVisible ? "open" : "closed"}
          productId={productId}
          quantity={quantity}
          productName={productName}
          unitPrice={unitPrice}
          presignedDocuments={presignedDocuments}
          onCompleted={() => {
            setPayVisible(false);
            onCloseCheckout?.();
            router.replace("/transaction/status");
          }}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  title: {
    color: CoffeePalette.forest,
    fontWeight: "600",
  },
  centered: {
    alignItems: "center",
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  checkboxList: {
    gap: Spacing.three,
  },
  errorText: {
    color: CoffeePalette.forest,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: CoffeePalette.forest,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  retryText: {
    color: CoffeePalette.warmWhite,
  },
  payButton: {
    backgroundColor: CoffeePalette.forest,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: "center",
    marginTop: Spacing.two,
  },
  payButtonDisabled: {
    opacity: 0.4,
  },
  payButtonText: {
    color: CoffeePalette.warmWhite,
    fontWeight: "bold",
  },
});
