// app/index.tsx hoặc screens/SmartDebtIntroScreen.tsx
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { scale, verticalScale } from '@/utils/stylings';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { storage } from '@/utils/storage';

const { height, width } = Dimensions.get('window');

const SmartDebtIntroScreen = () => {
  const router = useRouter();

  const handleStart = async () => {
    // Đánh dấu đã xem onboarding
    await storage.setOnboardingCompleted();
    // Điều hướng đến màn hình auth
    router.push('/auth/AuthScreen' as any);
  };

  return (
    <ImageBackground
      source={{ uri: "https://via.placeholder.com/375x812/0a0a0a/0a0a0a" }}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay tối để làm nổi nội dung */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header - Tiêu đề SMART DEBT */}
          <View style={styles.header}>
            <Text style={styles.title}>SMART DEBT</Text>
          </View>

          {/* Main illustration - Hình 1.png đã có sẵn nhân vật và icon */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require("@/assets/images/1.png")}
              style={styles.mainIllustration}
              resizeMode="contain"
            />
          </View>

          {/* Bottom section - Mô tả và nút */}
          <View style={styles.bottomSection}>
            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.mainDescription}>
                Quản lý chi tiêu - Nhắc nợ tự động
              </Text>
              <Text style={styles.subDescription}>
                Nhắc nhẹ, nhớ lâu - Ghi tình bạn, không quên nợ !
              </Text>
            </View>

            {/* Start button */}
            <TouchableOpacity
              onPress={handleStart}
              // onPress={() => {
              //   throw new Error("Fifth sentry error");
              // }}
              activeOpacity={0.8}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>BẮT ĐẦU</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.Neutral400,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.Neutral200,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: spacingY._40,
    paddingHorizontal: spacingX._20,
  },
  header: {
    alignItems: 'center',
    marginTop: spacingY._40,
  },
  title: {
    fontSize: scale(40),
    fontFamily: 'RowdiesBold',
    fontWeight: '900',
    color: colors.primary300,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacingY._20,
  },
  mainIllustration: {
    width: width * 0.85,
    height: width * 0.85,
    maxWidth: scale(350),
    maxHeight: scale(350),
  },
  bottomSection: {
    gap: spacingY._25,
  },
  descriptionContainer: {
    alignItems: 'center',
    gap: spacingY._12,
  },
  mainDescription: {
    fontSize: scale(21),
    fontFamily: 'RobotoBold',
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: scale(32),
  },
  subDescription: {
    fontSize: scale(15),
    fontFamily: 'RobotoRegular',
    fontWeight: '400',
    color: colors.Neutral100,
    textAlign: 'center',
    lineHeight: scale(22),
    opacity: 0.9,
    paddingHorizontal: spacingX._10,
  },
  startButton: {
    backgroundColor: colors.primary300,
    height: spacingY._60,
    borderRadius: radius._30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary300,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: scale(18),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default SmartDebtIntroScreen;