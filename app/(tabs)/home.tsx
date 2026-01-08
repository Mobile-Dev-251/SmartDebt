import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { BellSimple, QrCode, Plus } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";
import { useDispatch, useSelector } from "react-redux";
import { storage } from "../../utils/storage";
import { getMyProfile } from "@/service/userService";
import { getMyNotifications } from "@/service/userService";
import { getAllDebts } from "@/service/debtsService";
import { setUnreadCount } from "@/store/notifications";
import { RootState } from "@/store/store";
type Transaction = {
  id: string;
  name: string;
  note: string;
  amount: number;
  type: string;
  rawDate: string;
};

type SectionData = {
  title: string;
  data: Transaction[];
};

const formatCurrency = (value: number) => {
  const formatted = Math.abs(value).toLocaleString("vi-VN");
  return value < 0 ? `-${formatted}đ` : `${formatted}đ`;
};

const HomeScreen = () => {
  // 2. LẤY DATA TỪ REDUX
  const PAGE_ID = 'home';
  const dispatch = useDispatch();
  const router = useRouter();
  const [transactions, setTransactions] = useState<SectionData[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [totalMonth, setTotalMonth] = useState<number>(0);
  const [totalLend, setTotalLend] = useState<number>(0);
  const [totalBorrow, setTotalBorrow] = useState<number>(0);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const { unreadCount, readNotificationIds } = useSelector((state: RootState) => state.notifications);
  const { user: authUser } = useSelector((state: RootState) => state.auth);

  const loadData = useCallback(async () => {
    if (totalMonth === 0 && totalLend === 0 && totalBorrow === 0) {
      setLoadingSummary(true);
    }
    try {
      // Fetch Notifications
      try {
          const [notiRes, profileRes] = await Promise.all([
            getMyNotifications().catch(err => console.warn("Noti error", err)),
            getMyProfile().catch(err => console.warn("Profile error", err))
          ]);
          if (Array.isArray(notiRes)) {
              const unread = notiRes.filter((n: any) => !readNotificationIds.includes(n.id.toString()));
              dispatch(setUnreadCount(unread.length));
          }
      } catch (error) {
          console.warn("Failed to fetch notifications", error);
      }

      // --- PROFILE USER ---
      let currentUserId: number | null = null;
      let nameFromStorage = ""; 

      const storedUser = await storage.getUser(); 
      
      if (storedUser) {
        nameFromStorage = storedUser.full_name || storedUser.name || storedUser.email || "";
        if (storedUser.id) currentUserId = storedUser.id;
        if (storedUser.avatar_url) setAvatarUri(storedUser.avatar_url);
      }

      if (!nameFromStorage || currentUserId == null) {
        try {
          const profileRes: any = await getMyProfile();
          const profileData = Array.isArray(profileRes?.profile)
            ? profileRes.profile[0]
            : profileRes?.profile;

          if (profileData) {
            if (!nameFromStorage) {
              nameFromStorage = profileData.full_name || profileData.name || profileData.email || "";
            }
            if (currentUserId == null && profileData.id) {
              currentUserId = profileData.id;
            }
            if (profileData.avatar_url) {
              setAvatarUri(profileData.avatar_url);
            }
          }
        } catch (e: any) {
          console.warn("Lỗi lấy profile:", e?.message);
        }
      }

      if (nameFromStorage) {
        setUserName(nameFromStorage);
      }

      // --- LẤY DEBTS ---
      try {
        const debtsRes: any = await getAllDebts();
        const debts = Array.isArray(debtsRes) ? debtsRes : (debtsRes?.data || []);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let monthTotal = 0;
        let lendTotal = 0;
        let borrowTotal = 0;

        // Tính tổng
        debts.forEach((debt: any) => {
          const isLender = currentUserId === debt.lender_id;
          const isBorrower = currentUserId === debt.borrower_id;

          let transactionType: "lend" | "borrow" = "lend";
          if (debt.type === 'muon') {
            transactionType = isBorrower ? "borrow" : "lend";
          } else if (debt.type === 'cho_muon') {
            transactionType = isLender ? "lend" : "borrow";
          }

          const amount = Number(debt.amount) || 0;

          if (debt.status !== 'PAID') {
            if (transactionType === 'lend') lendTotal += amount;
            else borrowTotal += amount;

            const debtDate = new Date(debt.created_at || debt.due_date);
            if (debtDate.getMonth() === currentMonth && debtDate.getFullYear() === currentYear) {
              // Logic tính tổng chi tiêu tháng: tổng cho mượn - tổng mượn (có thể âm)
              monthTotal += (transactionType === 'lend' ? amount : -amount);
            }
          }
        });

        // Group by day cho 5 giao dịch gần nhất
        const grouped: {[key: string]: Transaction[]} = {};
        const dateKeys: string[] = [];

        debts.slice(0, 5).forEach((debt: any) => {
          const isLender = currentUserId === debt.lender_id;
          const isBorrower = currentUserId === debt.borrower_id;

          let displayName = "—";
          if (isLender) {
            displayName = debt.borrower_name || `User ${debt.borrower_id}`;
          } else if (isBorrower) {
            displayName = debt.lender_name || `User ${debt.lender_id}`;
          }

          let transactionType = "lend";
          if (debt.type === 'muon') {
            transactionType = isBorrower ? "borrow" : "lend";
          } else if (debt.type === 'cho_muon') {
            transactionType = isLender ? "lend" : "borrow";
          }

          const dateObj = new Date(debt.created_at || debt.due_date);
          const dayKey = dateObj.toLocaleDateString('vi-VN');

          if (!grouped[dayKey]) {
            grouped[dayKey] = [];
            dateKeys.push(dayKey);
          }

          grouped[dayKey].push({
            id: debt.id.toString(),
            name: displayName,
            note: debt.note || "",
            amount: debt.amount,
            type: transactionType,
            rawDate: debt.created_at
          });
        });

        const sections: SectionData[] = dateKeys.map(day => ({
          title: day,
          data: grouped[day],
        }));

        setTotalMonth(monthTotal);
        setTotalLend(lendTotal);
        setTotalBorrow(borrowTotal);
        setTransactions(sections);

      } catch (e) {
        console.warn("Lỗi debts:", e);
        setTransactions([]);
      }

    } finally {
      setLoadingSummary(false);
    }
  }, [readNotificationIds]); 

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const moneyColor = item.type === 'borrow' ? '#FF424F' : '#4285F4'; 
    const typeText = item.type === 'borrow' ? 'Mượn nợ' : item.type === 'group' ? 'Chi tiêu nhóm' : item.type === 'lend' ? 'Cho mượn' : '';

    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        activeOpacity={0.8}
        onPress={() => {
          router.push({
            pathname: '/transaction-detail',
            params: { id: item.id }
          });
        }}
      >
        <View style={styles.itemRow}>
          <View style={styles.avatarContainer}>
             <Image 
               source={require('../../assets/images/avatar.png')} 
               style={styles.avatar} 
             />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.noteText} numberOfLines={1}>{item.note}</Text>
          </View>
          <View style={styles.moneyContainer}>
            <Text style={styles.typeText}>{typeText}</Text>
            <Text style={[styles.amountText, { color: moneyColor }]}>{`${Number(item.amount).toLocaleString()}đ`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    );
  };

  useFocusEffect(
    useCallback(() => {
      if (authUser) {
        loadData();
      }
    }, [authUser, loadData])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={
              avatarUri
                ? { uri: avatarUri }
                : require("@/assets/images/avatar.png")
            }
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
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
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

      <View style={styles.transactionContainer}>
        <SectionList
          sections={transactions}
          keyExtractor={(item, index) => item.id + index}
          renderItem={renderTransactionItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.transactionContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={() => !loadingSummary ? (
            <Text style={{color: colors.Neutral100, textAlign: 'center', marginTop: 10}}>
              Chưa có giao dịch nào
            </Text>
          ) : null}
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => router.push({
          pathname: "/screen/add-transaction",
          params: {
            userName: userName,
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
    padding: spacingX._20,
    paddingBottom: spacingY._60 + spacingY._20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacingY._20,
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
  sectionTitle: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
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
  badge: {
    position: "absolute",
    right: -8,
    top: -8,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2F2E2E",
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(10),
  },
  itemContainer: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: spacingX._12,
  },
  infoContainer: {
    flex: 1,
  },
  moneyContainer: {
    alignItems: "flex-end",
  },
  nameText: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
    marginBottom: spacingY._3,
  },
  noteText: {
    color: colors.Neutral100,
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
  },
  typeText: {
    color: colors.Neutral100,
    fontFamily: "RobotoRegular",
    fontSize: scale(12),
    marginBottom: spacingY._3,
  },
  amountText: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
  },
  sectionHeader: {
    backgroundColor: colors.Neutral200,
    paddingVertical: spacingY._5,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._6,
    marginBottom: spacingY._10,
  },
  sectionHeaderText: {
    color: colors.Neutral100,
    fontFamily: "RobotoBold",
    fontSize: scale(14),
  },
  transactionContainer: {
    flex: 1,
  },
  transactionContent: {
    paddingBottom: spacingY._20,
  },
});

export default HomeScreen;