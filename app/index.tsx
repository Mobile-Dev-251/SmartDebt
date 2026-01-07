import { useRouter, Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ActivityIndicator, View } from 'react-native';

const StartPage = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const progress = useSelector((state: RootState) => state.progress);
  const router = useRouter();

  useEffect(() => {
    console.log('Auth state:', auth);
    console.log('Progress state:', progress);
    if (!auth.isLoading) {
      if (auth.token && auth.user) {
        // Đã đăng nhập, chuyển đến trang chính hoặc trang cuối
        const targetRoute = progress.currentRoute ? `/(tabs)/${progress.currentRoute}` : '/(tabs)/home';
        console.log('Navigate to:', targetRoute);
        router.replace(targetRoute as any);
      } else {
        // Chưa đăng nhập, chuyển đến onboarding
        console.log('Navigate to onboarding');
        router.replace('/OnboardingScreen');
      }
    }
  }, [auth.isLoading, auth.token, auth.user, progress.currentRoute, router]);

  // Hiển thị loading trong khi kiểm tra
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default StartPage;