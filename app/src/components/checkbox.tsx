import { CoffeePalette, Spacing } from "@/constants/theme";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
}

export function Checkbox({ checked, onToggle, label }: CheckboxProps) {
  return (
    <Pressable style={styles.row} onPress={onToggle}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? (
          <ThemedText type="small" style={styles.checkmark}>
            ✓
          </ThemedText>
        ) : null}
      </View>
      <ThemedText type="small" style={styles.label}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: Spacing.one,
    borderWidth: 2,
    borderColor: CoffeePalette.forest,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  boxChecked: {
    backgroundColor: CoffeePalette.forest,
  },
  checkmark: {
    color: CoffeePalette.warmWhite,
    fontWeight: "bold",
    lineHeight: 18,
  },
  label: {
    flex: 1,
    color: CoffeePalette.charcoal,
    lineHeight: 22,
  },
});
