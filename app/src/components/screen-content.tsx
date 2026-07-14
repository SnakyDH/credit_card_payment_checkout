import { ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { MaxContentWidth } from "@/constants/theme";

interface ScreenContentProps {
  children: ReactNode;
}

export function ScreenContent({ children }: ScreenContentProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= MaxContentWidth;

  return (
    <View style={[styles.container, isWide && styles.centered]}>
      <View
        style={[
          styles.content,
          isWide && { width: MaxContentWidth, maxWidth: "100%" },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  centered: {
    alignItems: "center",
  },
  content: {
    flex: 1,
    width: "100%",
  },
});
