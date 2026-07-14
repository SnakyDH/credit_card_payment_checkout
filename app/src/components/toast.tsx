import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { CoffeePalette, Spacing } from "@/constants/theme";

interface ToastProps {
  message: string | null;
  onHide: () => void;
}

const AUTO_HIDE_MS = 3000;

export function Toast({ message, onHide }: ToastProps) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(onHide, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [message, onHide]);

  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={styles.text}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.four,
    backgroundColor: CoffeePalette.velvet,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    zIndex: 100,
  },
  text: {
    color: CoffeePalette.warmWhite,
    textAlign: "center",
  },
});
