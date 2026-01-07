import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  PencilSimpleLine,
  CurrencyDollarSimple,
  CalendarBlank,
  Users,
  User,
  ArrowRight,
  ArrowLeft,
  Clock,
} from "phosphor-react-native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";
import { borrowerConfirmDebt, markDebtAsPaid, getDebtById } from "@/service/debtsService";
import { storage } from "@/utils/storage";
import { useSelector } from "react-redux";
import { getGroupExpenseDetail } from "@/service/groupsService";

// Component hiển thị 1 dòng thông tin
const DetailRow = ({
  icon,
  label,
  value,
  valueColor = "#FFFFFF"
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.row}>
    <View style={styles.iconWrapper}>{icon}</View>
    <View style={{flex: 1}}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  </View>
);

const TransactionDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const expenseId = params.expenseId as string;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [groupExpenseData, setGroupExpenseData] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const auth = useSelector((state: any) => state.auth);

  // 1. Lấy Current User ID
  useEffect(() => {
    const loadUserId = async () => {
      if (auth.user?.id) {
        setCurrentUserId(Number(auth.user.id));
      } else {
        const storedUser = await storage.getUser();
        if (storedUser?.id) setCurrentUserId(Number(storedUser.id));
      }
    };
    loadUserId();
  }, [auth.user?.id]);

  // 2. Fetch Data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        if (expenseId) {
             const groupResponse: any = await getGroupExpenseDetail(Number(expenseId));
             setGroupExpenseData(groupResponse.data || groupResponse);
             setData({
                 type: 'NỢ NHÓM',
                 status: 'OPEN',
                 created_at: groupResponse.data?.expense?.created_at
             });
        } else if (id) {
            if (params.typeValue === 'group') {
                 const groupResponse: any = await getGroupExpenseDetail(Number(id));
                 setGroupExpenseData(groupResponse.data || groupResponse);
                 setData({ type: 'NỢ NHÓM' });
            } else {
                 const response: any = await getDebtById(Number(id));
                 const debtData = response.data || response;
                 setData(debtData);
                 if (debtData.group_expense_id) {
                   const groupResponse: any = await getGroupExpenseDetail(debtData.group_expense_id);
                   setGroupExpenseData(groupResponse.data || groupResponse);
                 }
            }
        }
      } catch (e) {
        console.error("Error fetching detail:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, expenseId]);

  // --- Derived Values ---
  const debt = data || {};
  const groupExpense = groupExpenseData?.expense || {};
  const groupDebts = groupExpenseData?.debts || [];
  
  const isPayer = currentUserId === groupExpense.payer_id;
  const isGroup = !!groupExpenseData || debt.type === 'NỢ NHÓM' || params.typeValue === 'group';
  const isLender = currentUserId === debt.lender_id;
  const isBorrower = currentUserId === debt.borrower_id;

  let partnerName = "—";
  if (!isGroup) {
      if (isLender) partnerName = debt.borrower_name || `User ${debt.borrower_id}`;
      else if (isBorrower) partnerName = debt.lender_name || `User ${debt.lender_id}`;
  }

  // --- Logic Xử lý sự kiện ---
  const handleConfirm = async () => {
    if (!debt || !currentUserId) return;
    setLoading(true);
    try {
      if (isBorrower && (debt.status === 'OPEN' || debt.status === 'pending')) {
          await borrowerConfirmDebt(debt.id);
          Alert.alert("Thành công", "Đã gửi xác nhận trả tiền.");
      } else if (isLender && debt.status === 'PENDING_CONFIRMATION_BY_LENDER') {
          await markDebtAsPaid(debt.id);
          Alert.alert("Thành công", "Đã xác nhận nhận tiền.");
      }
      refreshData();
    } catch (error: any) { Alert.alert("Lỗi", error?.message); } 
    finally { setLoading(false); }
  }

  const handlePayerGroupConfirm = async (debtId: number) => {
    setLoading(true);
    try {
      await markDebtAsPaid(debtId);
      Alert.alert("Thành công", "Đã duyệt thanh toán.");
      refreshData();
    } catch (error: any) { Alert.alert("Lỗi", error?.message); } 
    finally { setLoading(false); }
  }

  const handleBorrowerGroupConfirm = async (debtId: number) => {
    setLoading(true);
    try {
      await borrowerConfirmDebt(debtId);
      Alert.alert("Thành công", "Đã báo trả tiền, vui lòng chờ chủ nhóm duyệt.");
      refreshData();
    } catch (error: any) { Alert.alert("Lỗi", error?.message); } 
    finally { setLoading(false); }
  }

  const refreshData = async () => {
      if (expenseId || (id && params.typeValue === 'group')) {
          const targetId = expenseId || id;
          const res: any = await getGroupExpenseDetail(Number(targetId));
          setGroupExpenseData(res.data || res);
      } else if (id) {
          const res: any = await getDebtById(Number(id));
          setData(res.data || res);
      }
  }

  // --- Logic Footer Button (Cá nhân) ---
  let footerButtonLabel = "";
  let showFooterButton = false;
  let footerButtonColor = colors.primary300;

  if (!isGroup && debt) {
      if (debt.status === 'PAID') {
          footerButtonLabel = "Đã hoàn thành";
          showFooterButton = true;
          footerButtonColor = "#4CAF50";
      } else if (isBorrower && (debt.status === 'OPEN' || debt.status === 'pending')) {
          footerButtonLabel = "Xác nhận đã trả";
          showFooterButton = true;
      } else if (isBorrower && debt.status === 'PENDING_CONFIRMATION_BY_LENDER') {
          footerButtonLabel = "Đang chờ xác nhận";
          showFooterButton = true;
          footerButtonColor = "#FFC107";
      } else if (isLender && debt.status === 'PENDING_CONFIRMATION_BY_LENDER') {
          footerButtonLabel = "Xác nhận đã nhận tiền";
          showFooterButton = true;
      } else if (isLender && (debt.status === 'OPEN' || debt.status === 'pending')) {
          footerButtonLabel = "Chờ người vay trả";
          showFooterButton = true;
          footerButtonColor = "#555";
      }
  }

  // --- Render ---
  let payerShare = 0;
  if (isGroup && groupExpense.total_amount) {
      const totalDebtAmount = groupDebts.reduce((sum: number, d: any) => sum + Number(d.amount), 0);
      payerShare = groupExpense.total_amount - totalDebtAmount;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>{`<`}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
            {isGroup ? "Chi tiêu nhóm" : "Chi tiết giao dịch"}
        </Text>
        <View style={{ width: scale(16) }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {loading && !data ? (
           <ActivityIndicator color="#FFF" style={{ marginTop: 20 }} />
        ) : (
           <>
             {/* --- PHẦN 1: THÔNG TIN CHUNG --- */}
             <View style={styles.infoSection}>
                {isGroup ? (
                    <>
                        <DetailRow
                            icon={<CurrencyDollarSimple size={20} color="#FFC107" weight="fill" />}
                            label="Tổng tiền chi tiêu"
                            value={`${groupExpense.total_amount?.toLocaleString('vi-VN')}đ`}
                            valueColor="#FFC107"
                        />
                        <DetailRow
                            icon={<User size={20} color="#FFF" weight="fill" />}
                            label="Họ và tên"
                            value={groupExpense.payer_name || `User ${groupExpense.payer_id}`}
                        />
                        <DetailRow
                            icon={<PencilSimpleLine size={20} color="#FFF" weight="fill" />}
                            label="Nội dung"
                            value={groupExpense.description || "Không có ghi chú"}
                        />
                        <DetailRow
                            icon={<CalendarBlank size={20} color="#FFF" weight="fill" />}
                            label="Ngày tạo"
                            value={groupExpense.created_at ? new Date(groupExpense.created_at).toLocaleDateString('vi-VN') : '—'}
                        />
                    </>
                ) : (
                    <>
                        <DetailRow
                            icon={<User size={20} color="#FFF" weight="fill" />}
                            label={isLender ? "Họ và tên" : "Họ và tên"}
                            value={partnerName}
                        />
                        <DetailRow
                            icon={<CurrencyDollarSimple size={20} color="#FFC107" weight="fill" />}
                            label="Số tiền"
                            value={`${Number(debt.amount).toLocaleString('vi-VN')}đ`}
                            valueColor="#FFC107"
                        />
                        <DetailRow
                            icon={isLender ? <ArrowRight size={20} color="#4CAF50"/> : <ArrowLeft size={20} color="#FF5252"/>}
                            label="Loại giao dịch"
                            value={isLender ? "Cho mượn " : " Mượn "}
                            valueColor={isLender ? "#4CAF50" : "#FF5252"}
                        />
                        <DetailRow
                            icon={<PencilSimpleLine size={20} color="#FFF" weight="fill" />}
                            label="Ghi chú"
                            value={debt.note || debt.description || "—"}
                        />
                        <DetailRow
                            icon={<Clock size={20} color="#FFF" weight="fill" />}
                            label="Trạng thái"
                            value={
                                debt.status === 'PAID' ? "Đã hoàn thành" : 
                                debt.status === 'PENDING_CONFIRMATION_BY_LENDER' ? "Chờ xác nhận" : "Chưa thanh toán"
                            }
                            valueColor={
                                debt.status === 'PAID' ? "#4CAF50" : 
                                debt.status === 'PENDING_CONFIRMATION_BY_LENDER' ? "#FFC107" : "#FF5252"
                            }
                        />
                        <DetailRow
                            icon={<CalendarBlank size={20} color="#FFF" weight="fill" />}
                            label="Ngày tạo"
                            value={debt.created_at ? new Date(debt.created_at).toLocaleDateString('vi-VN') : "—"}
                        />
                    </>
                )}
             </View>

             {/* --- PHẦN 2: DANH SÁCH THÀNH VIÊN (GROUP) --- */}
             {isGroup && (
                 <View style={styles.membersSection}>
                    <View style={styles.sectionHeader}>
                        <Users size={18} color="#FFF" weight="fill"/>
                        <Text style={styles.membersTitle}>Danh sách thành viên</Text>
                    </View>
                    
                    {/* Row Payer */}
                    <View style={styles.memberRow}>
                        <View style={styles.memberInfo}>
                             <Text style={styles.memberName}>
                                 {groupExpense.payer_name} {isPayer ? "(Bạn)" : ""}
                                 <Text style={{color: '#4CAF50', fontSize: 12}}> • Payer</Text>
                             </Text>
                             <Text style={styles.memberAmount}>{payerShare.toLocaleString('vi-VN')}đ</Text>
                        </View>
                        <View style={styles.rightAction}>
                             <Text style={[styles.statusText, {color: '#4CAF50'}]}>Đã xong</Text>
                        </View>
                    </View>

                    {/* List Borrowers */}
                    {groupDebts.map((memberDebt: any) => {
                        const isMe = memberDebt.borrower_id === currentUserId;
                        const mStatus = memberDebt.status;
                        
                        // 1. Xác định Trạng thái hiển thị (Text)
                        let statusText = "Chưa trả";
                        let statusColor = "#FF5252"; // Mặc định Đỏ
                        
                        if (mStatus === 'PAID') { 
                            statusText = "Đã trả"; 
                            statusColor = "#4CAF50"; // Xanh
                        } else if (mStatus === 'PENDING_CONFIRMATION_BY_LENDER') { 
                            statusText = "Chờ xác nhận"; 
                            statusColor = "#FFC107"; // Vàng
                        }

                        // 2. Xác định Logic Nút bấm
                        let showBtn = false;
                        let btnLabel = "";
                        let btnColor = colors.primary300; // Xanh dương
                        let btnAction = () => {};

                        if (isPayer) {
                            // LOGIC CHO PAYER (CHỦ NHÓM)
                            if (mStatus === 'PENDING_CONFIRMATION_BY_LENDER') {
                                // Nếu thành viên đang chờ xác nhận -> Hiện nút DUYỆT (Màu vàng nổi bật)
                                showBtn = true;
                                btnLabel = "Duyệt";
                                btnColor = "#FFC107"; // Nút màu vàng
                                btnAction = () => handlePayerGroupConfirm(memberDebt.id);
                            } else if (mStatus !== 'PAID') {
                                // Nếu chưa trả -> Hiện nút Xác nhận (nếu trả tiền mặt)
                                showBtn = true;
                                btnLabel = "Xác nhận";
                                btnColor = "#3A3A3A"; // Nút màu tối nhẹ nhàng hơn
                                btnAction = () => handlePayerGroupConfirm(memberDebt.id);
                            }
                        } else if (isMe) {
                            // LOGIC CHO MEMBER (NGƯỜI NỢ)
                            if (mStatus === 'OPEN' || mStatus === 'pending') {
                                // Nếu chưa trả -> Hiện nút Báo đã trả
                                showBtn = true;
                                btnLabel = "Báo đã trả";
                                btnAction = () => handleBorrowerGroupConfirm(memberDebt.id);
                            } 
                            // Nếu mStatus là PENDING -> showBtn = false -> Sẽ hiện text "Chờ xác nhận"
                        }

                        return (
                            <View key={memberDebt.id} style={styles.memberRow}>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>{memberDebt.borrower_name || `User ${memberDebt.borrower_id}`} {isMe && "(Bạn)"}</Text>
                                    <Text style={styles.memberAmount}>{Number(memberDebt.amount).toLocaleString('vi-VN')}đ</Text>
                                    {/* Note nhỏ nếu cần */}
                                    {mStatus === 'PENDING_CONFIRMATION_BY_LENDER' && (
                                        <Text style={{fontSize: 10, color: '#FFC107', fontStyle: 'italic', marginTop: 2}}>
                                            {isPayer ? "Yêu cầu duyệt" : "Đã báo trả"}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.rightAction}>
                                    {showBtn ? (
                                        <TouchableOpacity 
                                            style={[styles.miniBtn, {backgroundColor: btnColor}]} 
                                            onPress={btnAction}
                                        >
                                            <Text style={[
                                                styles.miniBtnText, 
                                                btnColor === '#FFC107' ? {color: '#000'} : {} // Nếu nút vàng thì chữ đen cho dễ đọc
                                            ]}>
                                                {btnLabel}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                 </View>
             )}
           </>
        )}
      </ScrollView>

      {/* --- FOOTER BUTTON (Cá nhân) --- */}
      {showFooterButton && !isGroup && (
          <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.footerBtn, {backgroundColor: footerButtonColor}]}
                onPress={handleConfirm}
                disabled={debt.status === 'PAID' || (isLender && debt.status === 'OPEN') || (isBorrower && debt.status === 'PENDING_CONFIRMATION_BY_LENDER')}
              >
                  {loading ? <ActivityIndicator color="#FFF"/> : <Text style={styles.footerBtnText}>{footerButtonLabel}</Text>}
              </TouchableOpacity>
          </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.Neutral200 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacingX._20, paddingVertical: spacingY._15, gap: spacingX._12 },
  back: { color: "#FFFFFF", fontSize: scale(18) },
  title: { flex: 1, color: "#FFFFFF", fontFamily: "RobotoBold", fontSize: scale(20) },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacingX._20, paddingBottom: spacingY._40, gap: spacingY._15 },
  infoSection: { gap: spacingY._12 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacingX._10, backgroundColor: '#3A3A3A', padding: 12, borderRadius: 12 },
  iconWrapper: { width: scale(26), marginTop: 2 },
  label: { color: "#AAAAAA", fontFamily: "RobotoRegular", fontSize: scale(12), marginBottom: 4 },
  value: { fontFamily: "RobotoBold", fontSize: scale(16) },
  
  // Styles Groups
  membersSection: { backgroundColor: '#3A3A3A', borderRadius: radius._12, padding: spacingX._15, marginTop: spacingY._10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacingY._15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#555' },
  membersTitle: { color: "#FFFFFF", fontFamily: "RobotoBold", fontSize: scale(16) },
  memberRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacingY._15 },
  memberInfo: { flex: 1, marginRight: 10 },
  memberName: { color: "#FFFFFF", fontFamily: "RobotoBold", fontSize: scale(14) },
  memberAmount: { color: "#E0E0E0", fontFamily: "RobotoRegular", fontSize: scale(13), marginTop: 2 },
  rightAction: { alignItems: 'flex-end', minWidth: 80 },
  statusText: { fontFamily: "RobotoBold", fontSize: scale(12) },
  miniBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  miniBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  // Styles Footer (Cá nhân)
  footer: { padding: 20, backgroundColor: colors.Neutral200, borderTopWidth: 1, borderTopColor: '#333' },
  footerBtn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  footerBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }
});

export default TransactionDetail;