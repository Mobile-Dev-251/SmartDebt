import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";

type TabType = "borrow" | "lend";

type MonthlyData = {
  month: string;
  value: number;
  color: string;
};

type PersonDebt = {
  id: string;
  name: string;
  outstandingDebt: number;
};

// Dữ liệu mẫu cho biểu đồ
const monthlyData: MonthlyData[] = [
  { month: "Tháng 6", value: 200, color: "#FF6B6B" },
  { month: "Tháng 7", value: 350, color: "#FFA500" },
  { month: "Tháng 8", value: 280, color: "#FFD700" },
  { month: "Tháng 9", value: 450, color: "#32CD32" },
  { month: "Tháng 10", value: 600, color: "#4169E1" },
  { month: "Tháng 11", value: 332, color: "#9370DB" },
];

// Dữ liệu mẫu cho người vay (Mượn nợ)
const borrowersData: PersonDebt[] = [
  { id: "1", name: "Hoàng Phương Bình", outstandingDebt: 172000 },
  { id: "2", name: "Nguyễn Kiều Chi", outstandingDebt: 20000 },
  { id: "3", name: "Phạm Nhật Kha", outstandingDebt: 140000 },
];

// Dữ liệu mẫu cho người cho vay (Khoản nợ)
const lendersData: PersonDebt[] = [
  { id: "1", name: "Hoàng Phương Bình", outstandingDebt: 172000 },
  { id: "2", name: "Nguyễn Kiều Chi", outstandingDebt: 20000 },
  { id: "3", name: "Phạm Hoàng Khang", outstandingDebt: 140000 },
];

const formatCurrency = (value: number) =>
  `${value.toLocaleString("vi-VN")}đ`;

const StatisticScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>("borrow");

  // Tính tổng số tiền
  const totalAmount =
    activeTab === "borrow"
      ? borrowersData.reduce((sum, person) => sum + person.outstandingDebt, 0)
      : lendersData.reduce((sum, person) => sum + person.outstandingDebt, 0);

  // Lấy dữ liệu người theo tab
  const peopleData =
    activeTab === "borrow" ? borrowersData : lendersData;

  // Tìm giá trị lớn nhất trong biểu đồ để tính tỷ lệ
  const maxValue = Math.max(...monthlyData.map((d) => d.value));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "borrow" && styles.tabActive]}
            onPress={() => setActiveTab("borrow")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "borrow" && styles.tabTextActive,
              ]}
            >
              Mượn nợ
            </Text>
            {activeTab === "borrow" && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "lend" && styles.tabActive]}
            onPress={() => setActiveTab("lend")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "lend" && styles.tabTextActive,
              ]}
            >
              Khoản nợ
            </Text>
            {activeTab === "lend" && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Total Amount */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>
            {activeTab === "borrow" ? "Tổng cho vay" : "Tổng nợ"}
          </Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chart}>
            {monthlyData.map((item, index) => {
              const barWidth = (item.value / maxValue) * 100;
              return (
                <View key={index} style={styles.chartBarContainer}>
                  <View style={styles.chartBarWrapper}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          width: `${barWidth}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartMonthLabel}>{item.month}</Text>
                </View>
              );
            })}
          </View>
          {/* X-axis labels */}
          <View style={styles.xAxisContainer}>
            <Text style={styles.xAxisLabel}>100</Text>
            <Text style={styles.xAxisLabel}>200</Text>
            <Text style={styles.xAxisLabel}>400</Text>
            <Text style={styles.xAxisLabel}>600</Text>
            <Text style={styles.xAxisLabel}>800</Text>
          </View>
        </View>

        {/* People List */}
        <View style={styles.peopleSection}>
          <Text style={styles.peopleSectionTitle}>
            {activeTab === "borrow" ? "Người vay" : "Người cho vay"}
          </Text>
          {peopleData.map((person) => (
            <View key={person.id} style={styles.personCard}>
              <View style={styles.personInfo}>
                <View style={styles.personAvatar}>
                  <Text style={styles.personAvatarText}>
                    {person.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.personName}>{person.name}</Text>
              </View>
              <Text
                style={[
                  styles.personDebt,
                  activeTab === "borrow"
                    ? styles.personDebtBlue
                    : styles.personDebtRed,
                ]}
              >
                Dư nợ {formatCurrency(person.outstandingDebt)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Neutral200,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: spacingX._20,
    marginBottom: spacingY._20,
  },
  tab: {
    flex: 1,
    paddingVertical: spacingY._12,
    alignItems: "center",
    position: "relative",
  },
  tabActive: {
    // Active state handled by indicator
  },
  tabText: {
    color: colors.Neutral100,
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(14),
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: scale(2),
    backgroundColor: colors.primary300,
    borderRadius: radius._3,
  },
  totalSection: {
    marginBottom: spacingY._25,
  },
  totalLabel: {
    color: colors.Neutral100,
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
    marginBottom: spacingY._5,
  },
  totalAmount: {
    color: "#FF6B6B",
    fontFamily: "RobotoBold",
    fontSize: scale(28),
    fontWeight: "700",
  },
  chartContainer: {
    marginBottom: spacingY._30,
  },
  chart: {
    gap: spacingY._10,
    marginBottom: spacingY._10,
  },
  chartBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  chartBarWrapper: {
    flex: 1,
    height: scale(24),
    backgroundColor: colors.Neutral300,
    borderRadius: radius._6,
    overflow: "hidden",
  },
  chartBar: {
    height: "100%",
    borderRadius: radius._6,
  },
  chartMonthLabel: {
    width: scale(70),
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(12),
  },
  xAxisContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: scale(80),
    marginTop: spacingY._5,
  },
  xAxisLabel: {
    color: colors.Neutral100,
    fontFamily: "RobotoRegular",
    fontSize: scale(10),
  },
  peopleSection: {
    gap: spacingY._12,
  },
  peopleSectionTitle: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
    marginBottom: spacingY._5,
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacingY._12,
    paddingHorizontal: spacingX._15,
    backgroundColor: colors.Neutral300,
    borderRadius: radius._12,
  },
  personInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
    flex: 1,
  },
  personAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.primary300,
    alignItems: "center",
    justifyContent: "center",
  },
  personAvatarText: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
  },
  personName: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
  },
  personDebt: {
    fontFamily: "RobotoBold",
    fontSize: scale(14),
  },
  personDebtBlue: {
    color: colors.primary300,
  },
  personDebtRed: {
    color: "#FF6B6B",
  },
});

export default StatisticScreen;
