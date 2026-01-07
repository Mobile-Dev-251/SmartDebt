import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, SectionList, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setCurrentRoute } from '@/store/progress';
import { getGroupMembers, getGroupHistoryExpenses } from '@/service/groupsService';
import { borrowerConfirmDebt, markDebtAsPaid } from '@/service/debtsService';
import { getAllDebts } from '@/service/debtsService';
import { storage } from '@/utils/storage';

interface Member {
  id: string;
  name: string;
  balance: number;
}

interface HistoryItem {
  id: string;
  description: string;
  total_amount: number;
  created_at: string;
  status?: string;
  isLender?: boolean;
  isBorrower?: boolean;
  borrower_name?: string;
  lender_name?: string;
}

interface SectionData {
  title: string;
  data: (Member | HistoryItem)[];
}

const screen_width  = Dimensions.get('window').width

const GroupMembersScreen = () => {
  const PAGE_ID = 'group-members';
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId?: string; groupName?: string }>();
  const groupId = (params.groupId as string) || '';
  const groupName = (params.groupName as string) || 'Nhóm';

  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setCurrentRoute({pageId: PAGE_ID}));
  }, [])

  useEffect(() => {
    const fetchMembers = async () => {
    setIsLoading(true);
    setError(null);

    if (!groupId) {
      setError('Không tìm thấy id nhóm');
      setSections([]);
      setIsLoading(false);
      return;
    }

    try {
      const storedUser = await storage.getUser();
      const currentUserId = storedUser?.id;

      const [membersRes, debtsRes, groupDebtsRes]: [any, any, any] = await Promise.all([
          getGroupMembers(Number(groupId)),
          getAllDebts(),
          getAllDebts() // or a new service for group debts
      ]);

      const members = Array.isArray(membersRes) ? membersRes : membersRes?.data || [];
      const debts = Array.isArray(debtsRes) ? debtsRes : debtsRes?.data || [];
      const groupDebts = debts.filter((d: any) => d.group_expense_id);

      // Calculate balance for each member relative to ME within this group context
      const membersWithBalance = members.map((m: any) => {
          let balance = 0;
          
          if (currentUserId) {
              debts.forEach((d: any) => {
                  // Only count outstanding group debts
                  const isOutstanding = d.status === 'OPEN' || d.status === 'PENDING_CONFIRMATION_BY_LENDER';
                  const isGroupDebt = d.type === 'NỢ NHÓM' || d.group_expense_id; // Check if related to group
                  
                  if (isOutstanding && isGroupDebt) {
                      if (d.lender_id === currentUserId && d.borrower_id === m.id) {
                          balance += Number(d.amount); // They owe me
                      } else if (d.borrower_id === currentUserId && d.lender_id === m.id) {
                          balance -= Number(d.amount); // I owe them
                      }
                  }
              });
          }

          return {
              id: String(m.id),
              name: m.name || String(m.id),
              balance: balance
          };
      });

      setSections([
        { title: 'Thành viên', data: membersWithBalance },
        { title: 'Giao dịch gần đây', data: groupDebts.map((d: any) => ({
          id: d.id.toString(),
          description: d.note || 'Giao dịch nhóm',
          total_amount: d.amount,
          created_at: d.created_at,
          status: d.status,
          isLender: currentUserId === d.lender_id,
          isBorrower: currentUserId === d.borrower_id,
          borrower_name: d.borrower_name,
          lender_name: d.lender_name
        })) }
      ]);

    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu thành viên.');
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchMembers();
}, [groupId]);

  const openMember = (m: Member) => {
    router.push({
      pathname: '/trans_user_profile/[id]',
      params: { id: m.id, name: m.name, type: 'user' }
    });
  };

  const handleConfirm = async (debtId: string, isBorrowerConfirm: boolean) => {
    try {
      if (isBorrowerConfirm) {
        await borrowerConfirmDebt(Number(debtId));
        Alert.alert('Thành công', 'Đã gửi yêu cầu xác nhận.');
      } else {
        await markDebtAsPaid(Number(debtId));
        Alert.alert('Thành công', 'Đã xác nhận nhận tiền.');
      }
      // Refresh data
      fetchMembers();
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra.');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    if ('balance' in item) {
      // Member
      let balanceText = "Đã thanh toán";
      let balanceColor = "#A0A0A0"; // Grey

      if (item.balance > 0) {
          balanceText = `Họ nợ bạn: ${item.balance.toLocaleString('vi-VN')}đ`;
          balanceColor = "#4CAF50"; // Green
      } else if (item.balance < 0) {
          balanceText = `Bạn nợ họ: ${Math.abs(item.balance).toLocaleString('vi-VN')}đ`;
          balanceColor = "#F44336"; // Red
      }

      return (
        <TouchableOpacity style={styles.memberRow} onPress={() => openMember(item)}>
          <Image source={require('../../assets/images/avatar.png')} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={[styles.memberSub, { color: balanceColor }]}>{balanceText} {'>'}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      // Transaction
      const canConfirm = item.status === 'OPEN' && item.isBorrower;
      const canMarkPaid = item.status === 'PENDING_CONFIRMATION_BY_LENDER' && item.isLender;
      const displayName = item.isLender ? item.borrower_name : item.lender_name;
      return (
        <View style={styles.memberRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName}>{displayName}</Text>
            <Text style={styles.memberSub}>{item.total_amount.toLocaleString('vi-VN')}đ - {new Date(item.created_at).toLocaleDateString('vi-VN')}</Text>
          </View>
          {(canConfirm || canMarkPaid) && (
            <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm(item.id, canConfirm)}>
              <Text style={styles.confirmButtonText}>{canConfirm ? 'Xác nhận trả' : 'Xác nhận nhận'}</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{groupName}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        <Text style={styles.sectionTitle}>Thành viên</Text>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator style={{ marginTop: 20 }} color="#FFF"/>
          </View>
        ) : error ? (
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', marginTop: 12 }}>{error}</Text>
          </View>
        ) : (
          <SectionList
            style={{ flex: 1 }}
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={() => <Text style={{ color: '#fff' }}>Không có thành viên</Text>}
            contentContainerStyle={{ paddingBottom: 140 }}
          />
        )}

      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert("Thông báo", "Chức năng thêm thành viên đang phát triển")}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'Roboto', fontSize: 20 }}>Thêm thành viên</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GroupMembersScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#2F2E2E' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 8 
  },
  backBtn: { 
    width: 36 
  },
  title: { 
    flex: 1, 
    textAlign: 'center', 
    color: '#fff', 
    fontFamily: 'Roboto',
    fontWeight: 'bold', 
    fontSize: 27
  },
  sectionTitle: { 
    color: '#fff', 
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 18, 
    marginBottom: 8 
  },
  memberRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderRadius: 12 
  },
  avatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    marginRight: 12, 
    backgroundColor: '#fff' 
  },
  memberName: { 
    color: '#fff', 
    fontFamily: 'Roboto',
    fontWeight: 'medium', 
    fontSize: 18 
  },
  memberSub: { 
    color: '#A0A0A0',
    fontFamily: 'Roboto',
    fontWeight: 'light', 
    fontSize: 13 
  },
  footer: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    bottom: 0,
    flex: 1, 
    backgroundColor: '#242323'
  },
  confirmButton: { 
    backgroundColor: '#3875F6', 
    padding: 8, 
    borderRadius: 5 
  },
  confirmButtonText: { 
    color: '#fff', 
    fontSize: 12 
  },
});