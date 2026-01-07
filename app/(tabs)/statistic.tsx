import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";
import { getAllDebts } from "@/service/debtsService";
import { getAllContacts } from "@/service/contactsService";
import { storage } from "@/utils/storage";
import { getMyGroups, getGroupMembers } from "@/service/groupsService"; 

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

const formatCurrency = (value: number) =>
  `${value.toLocaleString("vi-VN")}đ`;

const StatisticScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>("borrow");
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [borrowersData, setBorrowersData] = useState<PersonDebt[]>([]);
  const [lendersData, setLendersData] = useState<PersonDebt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Get current user ID
      let currentUserId: number | null = null;
      const storedUser = await storage.getUser();

      if (storedUser && storedUser.id) {
        currentUserId = storedUser.id;
      }

      // 2. Get all debts
      const debtsRes: any = await getAllDebts();
      const debts: any[] = Array.isArray(debtsRes) ? debtsRes : debtsRes?.data || [];

      // Process data for charts and lists
      const borrowMap: {[id: string]: {name: string, amount: number}} = {};
      const lendMap: {[id: string]: {name: string, amount: number}} = {};
      const monthlyStats: {[key: string]: number} = {};

      debts.forEach((debt: any) => {
        const amount = Number(debt.amount || 0);
        // Only consider unpaid or partially paid if tracking actual outstanding debt is complex, 
        // for now assuming amount is total amount.
        
        let type: "lend" | "borrow" = "borrow";
        let otherId: string = "";
        let otherName: string = "Unknown";

        if (currentUserId != null) {
          if (debt.lender_id === currentUserId) {
            type = "lend";
            otherId = String(debt.borrower_id);
            otherName = debt.borrower_name || `User ${debt.borrower_id}`;
          } else if (debt.borrower_id === currentUserId) {
            type = "borrow";
            otherId = String(debt.lender_id);
            otherName = debt.lender_name || `User ${debt.lender_id}`;
          } else {
             // Fallback
             type = "borrow";
             otherId = "unknown";
             otherName = debt.title || "Khoản nợ";
          }
        } else {
            type = "borrow";
            otherId = "unknown";
            otherName = debt.title || "Khoản nợ";
        }

        // Aggregate by person
        if (type === "borrow") {
            if (!borrowMap[otherId]) borrowMap[otherId] = { name: otherName, amount: 0 };
            borrowMap[otherId].amount += amount;
        } else {
            if (!lendMap[otherId]) lendMap[otherId] = { name: otherName, amount: 0 };
            lendMap[otherId].amount += amount;
        }

        // Aggregate by month for chart (based on due date or created date)
        const dateObj = new Date(debt.due_date || debt.created_at);
        const monthKey = `Tháng ${dateObj.getMonth() + 1}`;
        if (!monthlyStats[monthKey]) monthlyStats[monthKey] = 0;
        
        // If viewing "borrow" tab, show borrow stats, else lend stats?
        // Or show total volume? Let's filter by activeTab later or sum separately.
        // For simplicity, let's just sum volume for now or split.
        // The chart seems to show active tab's data distribution.
        if (activeTab === "borrow" && type === "borrow") {
             monthlyStats[monthKey] += amount;
        } else if (activeTab === "lend" && type === "lend") {
             monthlyStats[monthKey] += amount;
        }
      });

      // Convert maps to arrays
      const borrowers = Object.keys(borrowMap).map(id => ({
          id,
          name: borrowMap[id].name,
          outstandingDebt: borrowMap[id].amount
      }));

      const lenders = Object.keys(lendMap).map(id => ({
          id,
          name: lendMap[id].name,
          outstandingDebt: lendMap[id].amount
      }));

      // Convert monthly stats to array
      // Generate last 6 months keys to ensure order? Or just take what's available
      const months = Object.keys(monthlyStats).sort((a,b) => {
         // Sort by month number "Tháng X"
         const numA = parseInt(a.replace('Tháng ', ''));
         const numB = parseInt(b.replace('Tháng ', ''));
         return numA - numB;
      });

      const chartData: MonthlyData[] = months.map(m => ({
          month: m,
          value: monthlyStats[m],
          color: activeTab === "borrow" ? "#FF6B6B" : "#4285F4"
      }));

      setBorrowersData(borrowers);
      setLendersData(lenders);
      setMonthlyData(chartData);

    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [activeTab]) // Re-fetch or re-calculate when tab changes
  );

  // Tính tổng số tiền
  const totalAmount =
    activeTab === "borrow"
      ? borrowersData.reduce((sum, person) => sum + person.outstandingDebt, 0)
      : lendersData.reduce((sum, person) => sum + person.outstandingDebt, 0);

  // Lấy dữ liệu người theo tab
  const peopleData =
    activeTab === "borrow" ? borrowersData : lendersData;

  // Tìm giá trị lớn nhất trong biểu đồ để tính tỷ lệ
  const maxValue = monthlyData.length > 0 ? Math.max(...monthlyData.map((d) => d.value)) : 0;

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
              Cho mượn
            </Text>
            {activeTab === "lend" && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {isLoading ? (
             <ActivityIndicator size="large" color="#3275F1" style={{marginTop: 50}} />
        ) : (
            <>
                {/* Total Amount */}
                <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>
                    {activeTab === "borrow" ? "Tổng nợ" : "Tổng cho vay"}
                </Text>
                <Text style={[styles.totalAmount, { color: activeTab === "borrow" ? "#FF6B6B" : "#4285F4" }]}>
                    {formatCurrency(totalAmount)}
                </Text>
                </View>

                {/* Chart */}
                <View style={styles.chartContainer}>
                <View style={styles.chart}>
                    {monthlyData.length > 0 ? monthlyData.map((item, index) => {
                    const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
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
                    }) : (
                        <Text style={{color: '#888', textAlign: 'center'}}>Chưa có dữ liệu biểu đồ</Text>
                    )}
                </View>
                {/* X-axis labels placeholder - could be dynamic based on max value */}
                {monthlyData.length > 0 && (
                    <View style={styles.xAxisContainer}>
                        <Text style={styles.xAxisLabel}>0</Text>
                        <Text style={styles.xAxisLabel}>{formatCurrency(maxValue / 2)}</Text>
                        <Text style={styles.xAxisLabel}>{formatCurrency(maxValue)}</Text>
                    </View>
                )}
                </View>

                {/* People List */}
                <View style={styles.peopleSection}>
                <Text style={styles.peopleSectionTitle}>
                    {activeTab === "borrow" ? "Người tôi nợ" : "Người nợ tôi"}
                </Text>
                {peopleData.map((person) => (
                    <View key={person.id} style={styles.personCard}>
                    <View style={styles.personInfo}>
                        <View style={styles.personAvatar}>
                        <Text style={styles.personAvatarText}>
                            {person.name.charAt(0).toUpperCase()}
                        </Text>
                        </View>
                        <Text style={styles.personName}>{person.name}</Text>
                    </View>
                    <Text
                        style={[
                        styles.personDebt,
                        activeTab === "lend"
                            ? styles.personDebtBlue
                            : styles.personDebtRed,
                        ]}
                    >
                        Dư nợ {formatCurrency(person.outstandingDebt)}
                    </Text>
                    </View>
                ))}
                {peopleData.length === 0 && (
                    <Text style={{color: '#888', textAlign: 'center'}}>Không có dữ liệu</Text>
                )}
                </View>
            </>
        )}
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
    paddingRight: scale(80), // Offset for label space
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
