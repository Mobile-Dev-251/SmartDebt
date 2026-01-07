import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ShieldCheck, Star, HardDrive, EnvelopeSimple } from "phosphor-react-native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";
import { SafeAreaProvider } from "react-native-safe-area-context";

const AppInfoScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={scale(22)} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin ứng dụng</Text>
        <View style={{ width: scale(40) }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section - Giống trang Auth */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>SMART DEBT</Text>
          <Text style={styles.versionBadge}>Phiên bản 1.0.0</Text>
        </View>

        {/* Section: Tổng quan */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Star size={scale(20)} color={colors.primary300} weight="bold" />
            <Text style={styles.sectionTitle}>Sứ mệnh của chúng tôi</Text>
          </View>
          <Text style={styles.body}>
            Smart Debt không chỉ là công cụ quản lý tài chính, mà còn là cầu nối 
            giúp duy trì sự minh bạch trong tình bạn. Chúng tôi giúp bạn ghi lại 
            các khoản chi tiêu chung, mượn nợ và nhắc nhở đúng hạn một cách tinh tế.
          </Text>
        </View>

        {/* Section: Tính năng cốt lõi */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={scale(20)} color={colors.primary300} weight="bold" />
            <Text style={styles.sectionTitle}>Tính năng cốt lõi</Text>
          </View>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Ghi lại chi tiêu hội nhóm (du lịch, ăn uống)</Text>
            <Text style={styles.featureItem}>• Theo dõi các khoản cho mượn & mượn nợ</Text>
            <Text style={styles.featureItem}>• Hệ thống nhắc nợ tự động khi đến hạn</Text>
            <Text style={styles.featureItem}>• Đối soát trạng thái trả nợ minh bạch</Text>
            <Text style={styles.featureItem}>• Bảo mật & mã hóa dữ liệu cá nhân</Text>
          </View>
        </View>

        {/* Section: Quyền truy cập */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <HardDrive size={scale(20)} color={colors.primary300} weight="bold" />
            <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
          </View>
          <Text style={styles.body}>
            Để trải nghiệm tốt nhất, ứng dụng cần các quyền: {"\n"}
            - <Text style={{fontWeight: 'bold'}}>Thông báo:</Text> Nhắc trả tiền đúng hẹn.{"\n"}
            - <Text style={{fontWeight: 'bold'}}>Danh bạ:</Text> Thêm bạn nợ nhanh chóng.{"\n"}
            - <Text style={{fontWeight: 'bold'}}>Camera:</Text> Chụp ảnh nếu cần thiết.
          </Text>
        </View>

        {/* Section: Liên hệ */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <EnvelopeSimple size={scale(20)} color={colors.primary300} weight="bold" />
            <Text style={styles.sectionTitle}>Liên hệ & Phát triển</Text>
          </View>
          <Text style={styles.body}>
            Nhà phát triển: <Text style={styles.highlight}>Mobile Dev Team</Text>{"\n"}
            Email: <Text style={styles.highlight}>support@smartdebt.vn</Text>
          </Text>
        </View>

        <Text style={styles.footerText}>Made with ❤️ for Friendship</Text>
      </ScrollView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Neutral200,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._15,
  },
  backButton: {
    padding: scale(10),
  },
  headerTitle: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(18),
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._40,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: spacingY._30,
  },
  logoText: {
    fontSize: scale(36),
    fontFamily: 'RowdiesBold', 
    fontWeight: '900',
    color: colors.primary300,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  versionBadge: {
    color: colors.Neutral100,
    fontFamily: "RobotoRegular",
    fontSize: scale(12),
    marginTop: spacingY._5,
    backgroundColor: colors.Neutral300,
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: radius._10,
  },
  card: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._17,
    padding: spacingX._20,
    marginBottom: spacingY._20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: spacingY._10,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
  },
  body: {
    color: colors.Neutral100,
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
    lineHeight: scale(22),
  },
  featureList: {
    gap: spacingY._5,
  },
  featureItem: {
    color: colors.Neutral100,
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
  },
  highlight: {
    color: colors.primary300,
    fontFamily: "RobotoBold",
  },
  footerText: {
    textAlign: 'center',
    color: colors.Neutral100,
    fontSize: scale(12),
    opacity: 0.5,
    marginTop: spacingY._10,
  }
});

export default AppInfoScreen;













