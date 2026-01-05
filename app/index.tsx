import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ActivityIndicator, View } from 'react-native';

const StartPage = () => {
  const { token, isLoading } = useSelector((state: RootState) => state.auth);
  const { currentRoute, user } = useSelector((state: RootState) => state.progress);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      router.replace("/OnboardingScreen");
      return;
    }

    if (!currentRoute) {
      router.replace("/(tabs)/home");
      return;
    }

    if (currentRoute === "[id]" && user) {
      router.replace({
        pathname: `/trans_user_profile/${user.id}`,
        params: { 
          id: user.id, 
          name: user.userName, 
          type: user.type 
        }
      } as any);
    } 
    else if (["add-transaction", "create-group", "group-members", "select-screen"].includes(currentRoute)) {
      router.replace(`/screen/${currentRoute}` as any);
    } 
    else if (['recent', 'saved', 'group'].includes(currentRoute)) {
      router.replace({
        pathname: '/(tabs)/transaction',
        params: { tab: currentRoute }
      } as any);
    } 
    else {
      const finalPath = currentRoute.startsWith("/") ? currentRoute : `/${currentRoute}`;
      router.replace(finalPath as any);
    }
  }, [isLoading, token, currentRoute, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2F2E2E' }}>
      <ActivityIndicator size="large" color="#3875F6" />
    </View>
  );
};

export default StartPage;