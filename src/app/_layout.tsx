
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
} from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <AnimatedSplashOverlay />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="my-spot" />
        <Stack.Screen name="parking-essentials" />
        <Stack.Screen name="need-assistance" />
        <Stack.Screen name="ai-chat" />
        <Stack.Screen name="essentials" />
        <Stack.Screen name="parked" />
        <Stack.Screen name="voice-accessibility" />
      </Stack>
    </ThemeProvider>
  );
}
