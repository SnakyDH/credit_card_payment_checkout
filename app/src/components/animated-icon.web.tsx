import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const SPLASH_BACKGROUND = '#f5caa2';
const SPLASH_LOGO_SIZE = 220;

export function AnimatedSplashOverlay() {
  return null;
}

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Image
        style={styles.logo}
        source={require('@/assets/icon/app-icon.png')}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPLASH_BACKGROUND,
    width: SPLASH_LOGO_SIZE,
    height: SPLASH_LOGO_SIZE,
    borderRadius: 32,
  },
  logo: {
    width: SPLASH_LOGO_SIZE,
    height: SPLASH_LOGO_SIZE,
  },
});
