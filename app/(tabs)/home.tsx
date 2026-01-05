import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { BellSimple, QrCode, Plus } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";
import { storage } from "@/utils/storage";
import { getMyProfile } from "@/service/userService";
import { getAllDebts } from "@/service/debtsService";

type Transaction = {
  id: string;
  name: string;
  note: string;
  type: "lend" | "borrow" | "group";
  amount: number;
  borrowDate?: string;
  dueDate?: string;
  remind?: string;
  group?: string;
  paidStatus?: "unpaid" | "pending" | "paid";
  paidCount?: number;
  totalCount?: number;
};

const formatCurrency = (value: number) =>
  `${value.toLocaleString("vi-VN")}đ`;

const HomeScreen = () => {
  const PAGE_ID = 'home';
  const dispatch = useDispatch();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [totalMonth, setTotalMonth] = useState<number>(0);
  const [totalLend, setTotalLend] = useState<number>(0);
  const [totalBorrow, setTotalBorrow] = useState<number>(0);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoadingSummary(true);
    try {
      // 1. Lấy thông tin user để hiển thị tên
      let currentUserId: number | null = null;
      let nameFromStorage = "";

      const storedUser = await storage.getUser();
      if (storedUser) {
        nameFromStorage =
          storedUser.full_name || storedUser.name || storedUser.email || "";
        if (storedUser.id) {
          currentUserId = storedUser.id;
        }
      }

      // Nếu chưa có tên hoặc id, thử gọi API profile
      if (!nameFromStorage || currentUserId == null) {
        try {
          const profileRes: any = await getMyProfile();
          const profileData = Array.isArray(profileRes?.profile)
            ? profileRes.profile[0]
            : profileRes?.profile;

          if (profileData) {
            if (!nameFromStorage) {
              nameFromStorage =
                profileData.full_name ||
                profileData.name ||
                profileData.email ||
                "";
            }
            if (currentUserId == null && profileData.id) {
              currentUserId = profileData.id;
            }
          }
        } catch (e) {
          console.warn("Không thể lấy profile từ backend:", e);
        }
      }

      if (nameFromStorage) {
        setUserName(nameFromStorage);
      }

      // 2. Lấy danh sách debts để tính chi tiêu tháng này
      try {
        const debts: any[] = await getAllDebts();

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let monthLend = 0;
        let monthBorrow = 0;

        if (Array.isArray(debts)) {
          debts.forEach((debt: any) => {
            const amount = Number(debt.amount || 0);
            const dueDate = debt.due_date ? new Date(debt.due_date) : null;

            if (
              dueDate &&
              dueDate.getMonth() === currentMonth &&
              dueDate.getFullYear() === currentYear
            ) {
              // Xác định chiều nợ dựa vào lender_id / borrower_id
              if (currentUserId != null && debt.lender_id === currentUserId) {
                monthLend += amount;
              } else if (
                currentUserId != null &&
                debt.borrower_id === currentUserId
              ) {
                monthBorrow += amount;
              } else {
                // Nếu không xác định được, coi như mượn nợ
                monthBorrow += amount;
              }
            }
          });
        }

        setTotalLend(monthLend);
        setTotalBorrow(monthBorrow);
        // Chi tiêu tháng này: tạm thời tính là tổng số tiền mà user phải trả (mượn)
        setTotalMonth(monthBorrow);
      } catch (e) {
        console.warn("Không thể lấy dữ liệu debts:", e);
        setTotalLend(0);
        setTotalBorrow(0);
        setTotalMonth(0);
      }

      // 3. (Hiện tại) chưa hiển thị danh sách giao dịch từ backend nên để rỗng
      setTransactions([]);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <Image
              source={require("@/assets/images/1.png")}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View>
              <Text style={styles.profileName}>
                {userName || "SmartDebt User"}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
              <QrCode size={22} color="#fff" weight="bold" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.8}
              onPress={() => router.push("/notifications")}
            >
              <BellSimple size={22} color="#fff" weight="bold" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Chi tiêu tháng này:</Text>
          <Text style={styles.cardValue}>
            {loadingSummary ? "..." : formatCurrency(totalMonth)}
          </Text>

          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardSmallLabel}>Cho mượn:</Text>
              <Text style={[styles.cardSmallValue, styles.lendColor]}>
                {loadingSummary ? "..." : formatCurrency(totalLend)}
              </Text>
            </View>
            <View style={styles.cardColumn}>
              <Text style={styles.cardSmallLabel}>Mượn:</Text>
              <Text style={[styles.cardSmallValue, styles.borrowColor]}>
                {loadingSummary ? "..." : formatCurrency(totalBorrow)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Giao dịch gần đây:</Text>
        </View>

        <View style={styles.transactionList}>
          {transactions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.transactionItem}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/transaction-detail",
                  params: {
                    type: item.type === "lend" ? "Cho mượn" : item.type === "borrow" ? "Mượn nợ" : "Chi tiêu nhóm",
                    typeValue: item.type,
                    name: item.name,
                    note: item.note,
                    amount: formatCurrency(item.amount),
                    group: item.group ?? "",
                    borrowDate: item.borrowDate ?? "—",
                    dueDate: item.dueDate ?? "—",
                    remind: item.remind ?? "—",
                    paidStatus: item.paidStatus ?? "unpaid",
                    paidCount: item.paidCount ?? 0,
                    totalCount: item.totalCount ?? 0,
                  },
                })
              }
            >
              <View style={styles.transactionRow}>
                <Image
                  source={require("@/assets/images/1.png")}
                  style={styles.transactionAvatar}
                  resizeMode="cover"
                />
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionName}>
                    {item.type === "group" && item.group ? item.group : item.name}
                  </Text>
                  <Text style={styles.transactionNote} numberOfLines={1}>
                    {item.note}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <View
                    style={[
                      styles.tag,
                      item.type === "lend"
                        ? styles.tagLend
                        : item.type === "group"
                        ? styles.tagGroup
                        : styles.tagBorrow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        item.type === "lend"
                          ? styles.tagLendText
                          : item.type === "group"
                          ? styles.tagGroupText
                          : styles.tagBorrowText,
                      ]}
                      numberOfLines={1}
                    >
                      {item.type === "lend"
                        ? "Cho mượn"
                        : item.type === "group"
                        ? "Chi tiêu nhóm"
                        : "Mượn nợ"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      item.type === "lend"
                        ? styles.lendColor
                        : item.type === "group"
                        ? styles.groupColor
                        : styles.borrowColor,
                    ]}
                  >
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => router.push({
          pathname: "/screen/add-transaction",
          params: {
            userName: "",
            type: 'custom'
          }
        })}
      >
        <Plus size={32} color="#fff" weight="bold" />
      </TouchableOpacity>
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
    padding: spacingX._20,
    paddingBottom: spacingY._60 + spacingY._20,
    gap: spacingY._20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
  },
  avatar: {
    width: scale(46),
    height: scale(46),
    borderRadius: radius._30,
    backgroundColor: colors.Neutral300,
  },
  profileName: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
    fontWeight: "700",
  },
  profileSubtitle: {
    color: colors.Neutral100,
    fontFamily: "RobotoRegular",
    fontSize: scale(13),
  },
  headerActions: {
    flexDirection: "row",
    gap: spacingX._10,
  },
  iconButton: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius._12,
    backgroundColor: colors.Neutral300,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._20,
    padding: spacingX._20,
    gap: spacingY._12,
  },
  cardLabel: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
  },
  cardValue: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(32),
    fontWeight: "800",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardColumn: {
    gap: spacingY._5,
  },
  cardSmallLabel: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(13),
  },
  cardSmallValue: {
    fontFamily: "RobotoBold",
    fontSize: scale(15),
  },
  lendColor: {
    color: "#2F70FF",
  },
  borrowColor: {
    color: "#FF3B30",
  },
  sectionHeader: {
    marginTop: spacingY._5,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
  },
  transactionList: {
    gap: spacingY._12,
  },
  transactionItem: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._17,
    padding: spacingX._15,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  transactionAvatar: {
    width: scale(48),
    height: scale(48),
    borderRadius: radius._17,
    backgroundColor: colors.Neutral400,
  },
  transactionInfo: {
    flex: 1,
    gap: spacingY._3,
  },
  transactionName: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(15),
  },
  transactionNote: {
    color: colors.Neutral100,
    fontFamily: "RobotoRegular",
    fontSize: scale(13),
    marginTop: spacingY._3,
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: spacingY._5,
    minWidth: scale(100),
  },
  tag: {
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._5,
    borderRadius: radius._12,
  },
  tagLend: {
    backgroundColor: "#1E3054",
  },
  tagBorrow: {
    backgroundColor: "#3B1F1F",
  },
  tagGroup: {
    backgroundColor: "#2E2E4D",
  },
  tagText: {
    fontFamily: "RobotoBold",
    fontSize: scale(12),
  },
  tagLendText: {
    color: "#2F70FF",
  },
  tagGroupText: {
    color: "#8A7CFF",
  },
  tagBorrowText: {
    color: "#FF3B30",
  },
  transactionAmount: {
    fontFamily: "RobotoBold",
    fontSize: scale(15),
  },
  groupColor: {
    color: "#8A7CFF",
  },
  fab: {
    position: "absolute",
    right: spacingX._20,
    bottom: spacingY._20,
    width: scale(64),
    height: scale(64),
    borderRadius: radius._30,
    backgroundColor: colors.primary300,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary300,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
});

export default HomeScreen;
