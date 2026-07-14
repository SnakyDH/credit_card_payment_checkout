/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const CoffeePalette = {
  black: "#000000",
  forest: "#173F2B", // Verde principal
  forestDark: "#0D281C", // Botones, textos oscuros
  sage: "#73806A", // Iconos y elementos secundarios
  cream: "#F5EFE5", // Fondo principal
  warmWhite: "#FFF9F1", // Tarjetas
  beige: "#DED2C1", // Bordes y fondos secundarios
  caramel: "#B9783E", // Acentos relacionados con café
  gold: "#C69A59", // Detalles destacados
  coffee: "#5A3824", // Elementos marrones
  charcoal: "#242822", // Texto principal
  mutedText: "#777369", // Texto secundario
  // Semantic aliases (legacy starter template keys)
  velvet: "#7F2A3C",
  background: "#F5EFE5",
  backgroundElement: "#DED2C1",
  backgroundSelected: "#DED2C1",
  text: "#242822",
  textSecondary: "#777369",
} as const;

export type ThemeColor = keyof typeof CoffeePalette;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
