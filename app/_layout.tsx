import React, { useEffect } from "react";
import { Stack, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/theme";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";
import { Platform, View } from "react-native";
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../store/store';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { validateCurrentRoute } from '../store/progress';
import { useRouter } from 'expo-router';

// Component để handle navigation sau khi fonts loaded
function NavigationHandler() {
  const router = useRouter();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (user) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/OnboardingScreen');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [router, user, isLoading]);
  
  return null;
}

Sentry.init({
  dsn: "https://817dbd09cef2c274fa62598d5670cb64@o4510502748487680.ingest.de.sentry.io/4510502813368400",
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],
});

SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  const [fontsLoaded] = useFonts({
    RobotoRegular: require("../assets/fonts/Roboto-Regular.ttf"),
    RobotoBold: require("../assets/fonts/Roboto-Bold.ttf"),
    RowdiesRegular: require("../assets/fonts/Rowdies-Regular.ttf"),
    RowdiesBold: require("../assets/fonts/Rowdies-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // --- SỬA LỖI TẠI ĐÂY ---
  // Luôn luôn return Provider bọc ngoài cùng
  return (
    <Provider store={store}>
      <PersistGate 
        loading={null} 
        persistor={persistor}
        onBeforeLift={() => {
          // Validate currentRoute khi app start
          store.dispatch(validateCurrentRoute());
        }}
      >
        {/* Logic kiểm tra font nằm BÊN TRONG Provider */}
        {!fontsLoaded ? (
          // Nếu chưa load font, vẫn render Slot để giữ Navigation nhưng đã có Provider bọc
          <Slot />
        ) : (
          // Nếu đã load font, render App chính
          <>
            <StatusBar style="light" backgroundColor={colors.Neutral200} />
            <NavigationHandler />
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
              <Stack.Screen name="profile-info" options={{ title: "Thông tin cá nhân" }} />
              <Stack.Screen name="help-center" options={{ title: "Trung tâm trợ giúp" }} />
              <Stack.Screen name="app-info" options={{ title: "Thông tin ứng dụng" }} />
            </Stack>
          </>
        )}
      </PersistGate>
    </Provider>
  );
});