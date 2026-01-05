import React, { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/theme";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from "@/utils/notifications";
import { Platform } from "react-native";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../store/store';

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
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

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

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
        if (token) {
            console.log('Push token:', token);
            // TODO: Gửi token này lên server để lưu lại cho user
        }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Chưa load xong → không render UI
  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar style="light" backgroundColor={colors.Neutral200} />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.Neutral200 },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen
            name="index"
            options={{ title: "Smart Debt" }}
          />
          <Stack.Screen name="OnboardingScreen" options={{ title: "Smart Debt" }} />
          <Stack.Screen name="auth/AuthScreen" options={{ title: "Auth" }} />
          <Stack.Screen name="auth/login" options={{ title: "Login" }} />
          <Stack.Screen name="auth/register" options={{ title: "Register" }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="screen/add-transaction" options={{ title: "Thêm giao dịch" }} />
          <Stack.Screen name="screen/create-group" options={{ title: "Tạo nhóm" }} />
          <Stack.Screen name="notifications" options={{ title: "Thông báo" }} />
          <Stack.Screen name="transaction-detail" options={{ title: "Chi tiết giao dịch" }} />
          <Stack.Screen name="create-group" options={{ title: "Tạo nhóm" }} />
          <Stack.Screen name="profile-info" options={{ title: "Thông tin cá nhân" }} />
          <Stack.Screen name="help-center" options={{ title: "Trung tâm trợ giúp" }} />
          <Stack.Screen name="app-info" options={{ title: "Thông tin ứng dụng" }} />
        </Stack>
      </PersistGate>
    </Provider>
  );
});