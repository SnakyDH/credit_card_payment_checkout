import { CoffeePalette, Spacing } from "@/constants/theme";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  fullScreen?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  fullScreen = false,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, fullScreen && styles.overlayFullScreen]}>
        {!fullScreen ? (
          <Pressable style={styles.backdrop} onPress={onClose} />
        ) : null}
        <View
          style={[
            styles.sheet,
            fullScreen && styles.sheetFullScreen,
            {
              paddingTop: fullScreen
                ? insets.top + Spacing.two
                : Spacing.three,
              paddingBottom: Math.max(insets.bottom, Spacing.three),
            },
          ]}
        >
          {fullScreen ? (
            <View style={styles.header}>
              <ThemedText type="default" style={styles.headerTitle}>
                Pago
              </ThemedText>
              <Pressable onPress={onClose} hitSlop={12}>
                <ThemedText type="small" style={styles.closeButton}>
                  Cerrar
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.handle} />
          )}
          {fullScreen ? (
            <KeyboardAvoidingView
              style={styles.keyboardAvoiding}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              {children}
            </KeyboardAvoidingView>
          ) : (
            children
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlayFullScreen: {
    justifyContent: "flex-start",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    backgroundColor: CoffeePalette.warmWhite,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    minHeight: 160,
  },
  sheetFullScreen: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    minHeight: undefined,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  headerTitle: {
    color: CoffeePalette.forest,
    fontWeight: "600",
  },
  closeButton: {
    color: CoffeePalette.forest,
    fontWeight: "600",
  },
  keyboardAvoiding: {
    flex: 1,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: CoffeePalette.beige,
    marginBottom: Spacing.three,
  },
});
