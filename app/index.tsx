import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ActivityIndicator, View } from 'react-native';

const StartPage = () => {
  // Điều hướng đến trang landing để test backend
  return <Redirect href="/OnboardingScreen" />;
};

export default StartPage;