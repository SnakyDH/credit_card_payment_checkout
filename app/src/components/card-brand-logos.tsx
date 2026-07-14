import { Image, StyleSheet, View } from "react-native";

import { CardBrand } from "@/modules/transaction/utils/card-brand";
import { Spacing } from "@/constants/theme";

const CARD_LOGOS: Record<
  CardBrand.VISA | CardBrand.MASTERCARD,
  { source: number; width: number; height: number }
> = {
  [CardBrand.VISA]: {
    source: require("../../assets/brands/visa.png"),
    width: 52,
    height: 18,
  },
  [CardBrand.MASTERCARD]: {
    source: require("../../assets/brands/master-card.png"),
    width: 44,
    height: 28,
  },
};

interface CardBrandLogosProps {
  activeBrand: CardBrand;
}

export function CardBrandLogos({ activeBrand }: CardBrandLogosProps) {
  return (
    <View style={styles.row}>
      {([CardBrand.VISA, CardBrand.MASTERCARD] as const).map((brand) => {
        const logo = CARD_LOGOS[brand];
        const isActive = activeBrand === brand;
        const isDimmed = activeBrand !== CardBrand.UNKNOWN && !isActive;

        return (
          <View
            key={brand}
            style={[
              styles.badge,
              isActive && styles.badgeActive,
              isDimmed && styles.badgeDimmed,
            ]}
          >
            <Image
              source={logo.source}
              resizeMode="contain"
              style={{ width: logo.width, height: logo.height }}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.two,
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#FFFFFF",
  },
  badgeActive: {
    borderColor: "#173F2B",
    transform: [{ scale: 1.03 }],
  },
  badgeDimmed: {
    opacity: 0.35,
  },
});
