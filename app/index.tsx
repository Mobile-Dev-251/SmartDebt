// // app/index.tsx hoặc screens/SmartDebtIntroScreen.tsx
// import { colors, radius, spacingX, spacingY } from '@/constants/theme';
// import { scale } from '@/utils/stylings';
// import { Redirect, useRouter } from 'expo-router';
// import React from 'react';
// import {
//   Dimensions,
//   StyleSheet,
//   Platform
// } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { SafeAreaProvider } from 'react-native-safe-area-context';

// import HomeScreen from './(tabs)/home';
// import TransactionScreen from './(tabs)/transaction';
// import ProfileScreen from './(tabs)/profile';
// import StatisticScreen from './(tabs)/statistic';

// import Entypo from '@expo/vector-icons/Entypo';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

// const { height, width } = Dimensions.get('window');
// const BottomTab = createBottomTabNavigator();

// const SmartDebtIntroScreen = () => {
//   const router = useRouter();

//   const handleStart = () => {
//     // Điều hướng đến màn hình chính
//     // Thay đổi route phù hợp: '/(tabs)', '/home', '/auth/login', etc.
//     // router.push('/auth/AuthScreen' as any);
//   };

//   return (
//     <SafeAreaProvider>
//       <BottomTab.Navigator 
//       initialRouteName="Transaction"
//       screenOptions={{
//         headerStyle: {backgroundColor: '#2F2E2E'},
//         headerTintColor: '#FFFFFF',
//         tabBarStyle: {
//           backgroundColor: '#2F2E2E',
//           borderTopWidth: 0, // Xóa đường kẻ trên
//           elevation: 0,      // Xóa bóng đổ trên Android
          
//           // Tăng chiều cao lên để không bị hụt
//           height: Platform.OS === 'android' ? 60 : 60, 
          
//           // Đẩy icon/text lên trên một chút để không bị dính vào mép dưới
//           paddingBottom: Platform.OS === 'android' ? 10 : 20,
//           paddingTop: 10,
//         },
//         tabBarActiveTintColor: '#3275F1',
//         tabBarInactiveTintColor: '#FFFFFF' ,
//       }}>
//         <BottomTab.Screen 
//           name = 'Home'
//           component={HomeScreen}
//           options={{
//             title: 'Trang chủ',
//             tabBarIcon: ({color}) => (
//               <Entypo name="home" size={24} color={color} />
//             )
//           }}
//         />
//         <BottomTab.Screen 
//           name = 'Transaction'
//           component={TransactionScreen}
//           options={{
//             title: 'Giao dịch',
//             tabBarIcon: ({color}) => (
//               <Ionicons name="wallet-sharp" size={24} color={color} />
//             )
//           }}
//         />
//         <BottomTab.Screen 
//           name = 'Statistic'
//           component={StatisticScreen}
//           options={{
//             title: 'Thống kê',
//             tabBarIcon: ({color}) => (
//               <Entypo name="bar-graph" size={24} color={color} />
//             )
//           }}
//         />
//         <BottomTab.Screen 
//           name = 'Profile'
//           component={ProfileScreen}
//           options={{
//             title: 'Tôi',
//             tabBarIcon: ({color}) => (
//               <FontAwesome5 name="user-alt" size={24} color={color} />
//             )
//           }}
//         />
//       </BottomTab.Navigator>
//     </SafeAreaProvider>
//   )

//   // return (
//   //   <ImageBackground
//   //     source={{ uri: 'https://via.placeholder.com/375x812/0a0a0a/0a0a0a' }}
//   //     style={styles.background}
//   //     resizeMode="cover"
//   //   >
//   //     {/* Overlay tối để làm nổi nội dung */}
//   //     <View style={styles.overlay} />

//   //     <SafeAreaView style={styles.container}>
//   //       <View style={styles.content}>
          
//   //         {/* Header - Tiêu đề SMART DEBT */}
//   //         <View style={styles.header}>
//   //           <Text style={styles.title}>SMART DEBT</Text>
//   //         </View>

//   //         {/* Main illustration - Hình 1.png đã có sẵn nhân vật và icon */}
//   //         <View style={styles.illustrationContainer}>
//   //           <Image 
//   //             source={require('@/assets/images/1.png')} 
//   //             style={styles.mainIllustration}
//   //             resizeMode="contain"
//   //           />
//   //         </View>

//   //         {/* Bottom section - Mô tả và nút */}
//   //         <View style={styles.bottomSection}>
//   //           {/* Description */}
//   //           <View style={styles.descriptionContainer}>
//   //             <Text style={styles.mainDescription}>
//   //               Quản lý chi tiêu - Nhắc nợ tự động
//   //             </Text>
//   //             <Text style={styles.subDescription}>
//   //               Nhắc nhẹ, nhớ lâu - Ghi tình bạn, không quên nợ !
//   //             </Text>
//   //           </View>

//   //           {/* Start button */}
//   //           <TouchableOpacity
//   //             onPress={handleStart}
//   //             activeOpacity={0.8}
//   //             style={styles.startButton}
//   //           >
//   //             <Text style={styles.startButtonText}>BẮT ĐẦU</Text>
//   //           </TouchableOpacity>
//   //         </View>
//   //       </View>
//   //     </SafeAreaView>
//   //   </ImageBackground>
//   // );
// };

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     backgroundColor: colors.Neutral400,
//   },
//   overlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: colors.Neutral200,
//   },
//   container: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'space-between',
//     paddingBottom: spacingY._40,
//     paddingHorizontal: spacingX._20,
//   },
//   header: {
//     alignItems: 'center',
//     marginTop: spacingY._40,
//   },
//   title: {
//     fontSize: scale(40),
//     fontFamily: 'RowdiesBold',
//     fontWeight: '900',
//     color: colors.primary300,
//     letterSpacing: 2,
//     textTransform: 'uppercase',
//   },
//   illustrationContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: spacingY._20,
//   },
//   mainIllustration: {
//     width: width * 0.85,
//     height: width * 0.85,
//     maxWidth: scale(350),
//     maxHeight: scale(350),
//   },
//   bottomSection: {
//     gap: spacingY._25,
//   },
//   descriptionContainer: {
//     alignItems: 'center',
//     gap: spacingY._12,
//   },
//   mainDescription: {
//     fontSize: scale(21),
//     fontFamily: 'RobotoBold',
//     fontWeight: '700',
//     color: '#FFFFFF',
//     textAlign: 'center',
//     lineHeight: scale(32),
//   },
//   subDescription: {
//     fontSize: scale(15),
//     fontFamily: 'RobotoRegular',
//     fontWeight: '400',
//     color: colors.Neutral100,
//     textAlign: 'center',
//     lineHeight: scale(22),
//     opacity: 0.9,
//     paddingHorizontal: spacingX._10,
//   },
//   startButton: {
//     backgroundColor: colors.primary300,
//     height: spacingY._60,
//     borderRadius: radius._30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: colors.primary300,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.5,
//     shadowRadius: 16,
//     elevation: 12,
//   },
//   startButtonText: {
//     color: '#FFFFFF',
//     fontSize: scale(18),
//     fontWeight: '700',
//     letterSpacing: 1,
//     textTransform: 'uppercase',
//   },
// });

// export default SmartDebtIntroScreen;

// app/index.tsx
import { Redirect } from 'expo-router';
import React from 'react';

const StartPage = () => {
  // Điều hướng ngay lập tức vào folder (tabs), màn hình home
  return <Redirect href="/(tabs)/home" />;
};

export default StartPage;