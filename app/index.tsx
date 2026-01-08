import { useRouter } from 'expo-router'; // Xóa Redirect không dùng
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ActivityIndicator, View } from 'react-native';
import { storage } from '../utils/storage';

const StartPage = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const progress = useSelector((state: RootState) => state.progress);
  const router = useRouter();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const loadOnboarding = async () => {
      const completed = await storage.getOnboardingCompleted();
      console.log('Raw onboarding from storage:', completed); // Debug: true/false
      setOnboardingCompleted(completed);
    };
    loadOnboarding();
  }, []);

  useEffect(() => {
    console.log('--- StartPage Effect Triggered ---');
    console.log('Auth state:', JSON.stringify(auth, null, 2)); // Toàn bộ auth để kiểm tra
    console.log('Auth.user details:', auth.user ? `Type: ${typeof auth.user}, Keys: ${Object.keys(auth.user).length}` : 'null/undefined');
    console.log('Progress state:', JSON.stringify(progress, null, 2));
    console.log('Onboarding completed:', onboardingCompleted);

    if (!auth.isLoading && onboardingCompleted !== null) {
      // Kiểm tra nghiêm ngặt: User phải là object, không rỗng, và có field chính (ví dụ: 'id' - điều chỉnh theo schema user)
      const isValidUser = auth.user && typeof auth.user === 'object' && Object.keys(auth.user).length > 0 && auth.user.id;
      
      if (isValidUser) {
        console.log('Phát hiện user hợp lệ - Redirect đến home');
        const targetRoute = progress.currentRoute ? `/(tabs)/${progress.currentRoute}` : '/(tabs)/home';
        console.log('Navigate to:', targetRoute);
        router.replace(targetRoute as any);
      } else {
        console.log('Không có user hợp lệ - Kiểm tra onboarding');
        if (onboardingCompleted) {
          console.log('Onboarding đã hoàn thành - Navigate đến auth');
          router.push('/auth/AuthScreen');
        } else {
          console.log('Onboarding chưa hoàn thành - Navigate đến onboarding');
          router.push('/OnboardingScreen');
        }
      }
    }
  }, [auth.isLoading, auth.token, auth.user, progress.currentRoute, router, onboardingCompleted]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default StartPage;