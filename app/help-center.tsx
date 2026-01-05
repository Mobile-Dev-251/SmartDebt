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
import { 
  ArrowLeft, 
  CaretRight, 
  Users, 
  TrendUp, 
  TrendDown, 
  CalendarCheck, 
  ChartPieSlice,
  Info
} from "phosphor-react-native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";

const HELP_DATA = [
  {
    id: "group_expense",
    title: "Chi tiêu hội nhóm",
    icon: <Users size={scale(20)} color={colors.primary300} weight="bold" />,
    items: [
      { id: "ge1", label: "Cách chia đều hóa đơn cho nhóm" },
      { id: "ge2", label: "Tùy chỉnh số tiền cho từng thành viên" },
      { id: "ge3", label: "Tổng kết số dư cuối kỳ của nhóm" },
    ],
  },
  {
    id: "tracking",
    title: "Quản lý mượn & cho mượn",
    icon: <TrendUp size={scale(20)} color="#4ADE80" weight="bold" />, // Màu xanh cho việc cho mượn
    items: [
      { id: "t1", label: "Ghi chép khoản cho bạn mượn" },
      { id: "t2", label: "Ghi chép khoản mình nợ bạn" },
      { id: "t3", label: "Đánh giá trạng thái (Đã trả / Chưa trả)" },
    ],
  },
  {
    id: "notifications",
    title: "Nhắc nhở đến hạn",
    icon: <CalendarCheck size={scale(20)} color="#FACC15" weight="bold" />,
    items: [
      { id: "n1", label: "Cài đặt ngày nhắc nợ tự động" },
      { id: "n2", label: "Tần suất nhắc nhở (Một lần / Định kỳ)" },
      { id: "n3", label: "Cách bật thông báo trên điện thoại" },
    ],
  },
  {
    id: "statistics",
    title: "Thống kê & Báo cáo",
    icon: <ChartPieSlice size={scale(20)} color="#F87171" weight="bold" />,
    items: [
      { id: "s1", label: "Xem tổng dư nợ hiện tại" },
      { id: "s2", label: "Lịch sử giao dịch theo tháng" },
      { id: "s3", label: "Biểu đồ chi tiêu hội nhóm" },
    ],
  },
];

const HelpCenterScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={scale(22)} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <Text style={styles.title}>Trung tâm trợ giúp</Text>
        <View style={{ width: scale(40) }} />
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Banner định vị app */}
        <View style={styles.banner}>
          <Info size={scale(24)} color={colors.primary300} weight="bold" />
          <Text style={styles.bannerText}>
            Smart Debt giúp bạn quản lý các khoản mượn và chi tiêu nhóm một cách khoa học, rõ ràng.
          </Text>
        </View>

        {HELP_DATA.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              {section.icon}
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {section.items.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.faqCard} 
                activeOpacity={0.7}
                onPress={() => alert(`Hướng dẫn: ${item.label}`)}
              >
                <Text style={styles.itemText}>{item.label}</Text>
                <CaretRight size={scale(16)} color={colors.Neutral100} weight="bold" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <Text style={styles.version}>Smart Debt v1.0 • Minh bạch tài chính</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Neutral200,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._15,
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
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
  banner: {
    backgroundColor: "rgba(50,117,241,0.08)",
    padding: spacingX._15,
    borderRadius: radius._12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
    marginBottom: spacingY._25,
    borderWidth: 1,
    borderColor: "rgba(50,117,241,0.2)",
  },
  bannerText: {
    color: colors.Neutral100,
    fontSize: scale(13),
    flex: 1,
    lineHeight: scale(18),
    fontFamily: "RobotoRegular",
  },
  section: {
    marginBottom: spacingY._25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
    marginBottom: spacingY._12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
  },
  faqCard: {
    backgroundColor: colors.Neutral300,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._17,
    borderRadius: radius._12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._10,
  },
  itemText: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
    flex: 1,
  },
  version: {
    textAlign: 'center',
    color: colors.Neutral100,
    fontSize: scale(11),
    opacity: 0.5,
    marginTop: spacingY._10,
  }
});

export default HelpCenterScreen;







