import React from "react";
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
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";

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

const transactions: Transaction[] = [
  {
    id: "1",
    name: "Hoàng Phương Bình",
    note: "Tiền ăn trưa",
    type: "lend",
    amount: 50000,
    borrowDate: "01/12/2025",
    dueDate: "01/01/2026",
    remind: "Trước 1 ngày (lặp lại)",
    paidStatus: "unpaid",
  },
  {
    id: "2",
    name: "Hoàng Phương Bình",
    note: "Tiền trả sữa",
    type: "borrow",
    amount: 50000,
    borrowDate: "01/12/2025",
    dueDate: "01/01/2026",
    remind: "Trước 1 ngày (lặp lại)",
    paidStatus: "unpaid",
  },
  {
    id: "3",
    name: "Hoàng Phương Bình",
    note: "Du lịch Đà Lạt",
    type: "group",
    group: "Hội bạn du lịch",
    amount: 2000000,
    borrowDate: "01/12/2025",
    dueDate: "01/01/2026",
    remind: "Trước 1 ngày (lặp lại)",
    paidStatus: "unpaid",
    paidCount: 1,
    totalCount: 5,
  },
];

const formatCurrency = (value: number) =>
  `${value.toLocaleString("vi-VN")}đ`;

const HomeScreen = () => {
  const router = useRouter();

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
              <Text style={styles.profileName}>Hoàng Phương Bình</Text>
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
          <Text style={styles.cardValue}>2.000.000 đ</Text>

          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardSmallLabel}>Cho mượn:</Text>
              <Text style={[styles.cardSmallValue, styles.lendColor]}>
                {formatCurrency(3000000)}
              </Text>
            </View>
            <View style={styles.cardColumn}>
              <Text style={styles.cardSmallLabel}>Mượn:</Text>
              <Text style={[styles.cardSmallValue, styles.borrowColor]}>
                {formatCurrency(1000000)}
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
        onPress={() => router.push("/screen/add-transaction")}
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
