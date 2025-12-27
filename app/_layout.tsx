// app/_layout.tsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/theme";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://817dbd09cef2c274fa62598d5670cb64@o4510502748487680.ingest.de.sentry.io/4510502813368400",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Không cho splash tự ẩn
SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  // Load font
  const [fontsLoaded] = useFonts({
    RobotoRegular: require("../assets/fonts/Roboto-Regular.ttf"),
    RobotoBold: require("../assets/fonts/Roboto-Bold.ttf"),
    RowdiesRegular: require("../assets/fonts/Rowdies-Regular.ttf"),
    RowdiesBold: require("../assets/fonts/Rowdies-Bold.ttf"),
  });

  // Khi font load xong → ẩn splash
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Chưa load xong → không render UI
  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.Neutral200} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.Neutral200 },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="HomeScreen"
          options={{ title: "Smart Debt" }}
        />
      </Stack>
    </>
  );
});