import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Appearance } from "react-native";

import { appTheme, colors } from "@/src/theme";

export default function RootLayout() {
  useEffect(() => {
    Appearance.setColorScheme?.("dark");
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {
      // Best-effort to keep the native background in sync.
    });
  }, []);

  return (
    <ThemeProvider value={appTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="extraction/[id]" options={{ title: "Extraction Details" }} />
      </Stack>
    </ThemeProvider>
  );
}
