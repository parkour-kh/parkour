
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import {
  ParkourThemeProvider,
  useParkourTheme,
} from "@/contexts/parkour-theme";

SplashScreen.preventAutoHideAsync();

function AppNavigation() {
  const { isDark } = useParkourTheme();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="my-spot" />
        <Stack.Screen name="parking-essentials" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ParkourThemeProvider>
      <AppNavigation />
    </ParkourThemeProvider>
  );
}
