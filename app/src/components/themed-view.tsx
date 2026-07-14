import { View, type ViewProps } from "react-native";

import { CoffeePalette, ThemeColor } from "@/constants/theme";

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
};

export function ThemedView({ style, type, ...otherProps }: ThemedViewProps) {
  const backgroundColor =
    CoffeePalette[type ?? "cream"] ?? CoffeePalette.cream;

  return (
    <View style={[{ backgroundColor }, style]} {...otherProps} />
  );
}
