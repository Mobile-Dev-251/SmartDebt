import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';

import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useDispatch } from 'react-redux';
import { setCurrentRoute } from '@/store/progress';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const TabsLayout = () => {
  const dispatch = useDispatch();
  // const initialTab = tab === 'saved' ? "Đã lưu" : 
  //                   tab === 'group' ? "Nhóm" : 
  //                   "Gần đây";

  return (
    <SafeAreaProvider>
    <Tabs
    screenListeners={{
      state: (e) => {
        const state = e.data.state;
        const currentTabName = state.routes[state.index].name;
        
        // Chỉ lưu progress cho các tab chính
        const mainTabs = ['home', 'recent', 'saved', 'group', 'statistic', 'profile'];
        if (mainTabs.includes(currentTabName)) {
          dispatch(setCurrentRoute({ pageId: currentTabName }));
        }
      },
    }}
      screenOptions={{
        headerShown: true,
        headerTitleAlign:'center',
        headerTitleStyle: {fontFamily: 'Roboto', fontSize: 27, fontWeight: 'bold', color: '#FFFFFF'},
        headerStyle: {
          backgroundColor: '#2F2E2E'
        },
        tabBarActiveTintColor: '#3275F1',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#2F2E2E',
          borderTopWidth: 0,
          elevation: 0,
          
          height: Platform.OS === 'android' ? 75 : 70, 
          paddingBottom: Platform.OS === 'android' ? 5 : 15,
          paddingTop: 12,
        },
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Trang chủ',
          tabBarLabelStyle: {fontSize: 12, fontFamily: 'Roboto'},
          tabBarIcon: ({ color }) => <Entypo name="home" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="transaction" 
        options={{
          title: "Giao dịch",
          tabBarLabelStyle: {fontSize: 12, fontFamily: 'Roboto'},
          tabBarIcon: ({ color }) => <Ionicons name="wallet-sharp" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="statistic" 
        options={{ 
          title: 'Thống kê',
          tabBarLabelStyle: {fontSize: 12, fontFamily: 'Roboto'},
          tabBarIcon: ({ color }) => <Entypo name="bar-graph" size={24} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          headerTitle: 'Thông tin cá nhân',
          tabBarLabel: 'Tôi',
          tabBarLabelStyle: {fontSize: 12, fontFamily: 'Roboto'},
          tabBarIcon: ({ color }) => <FontAwesome5 name="user-alt" size={24} color={color} />,
        }} 
      />

      <Tabs.Screen name="group" options={{ href: null }} />
      <Tabs.Screen name="recent" options={{ href: null }} />
      <Tabs.Screen name="saved" options={{ href: null }} />
    </Tabs>
    </SafeAreaProvider>
  );
};

export default TabsLayout;