import React, { useState, useEffect, useCallback } from 'react'
import { Dimensions, StyleSheet, Text, View, SectionList, ActivityIndicator, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { getAllDebts } from "@/service/debtsService";
import { getMyGroups, getGroupMembers } from '@/service/groupsService';
import { getAllContacts } from '@/service/contactsService';
import { useDispatch } from 'react-redux';
import { useFocusEffect, useRouter } from 'expo-router';
import { storage } from "../../utils/storage";

interface TransactionItem {
  id: string;
  name: string;
  note: string;
  amount: number;
  type: string;
  rawDate: string;
}

interface SectionData {
  title: string;
  data: TransactionItem[];
}

const RecentScreen = () => {
  const [listByDay, setListByDay] = useState<SectionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const dispatch = useDispatch()
  const router = useRouter()

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const storedUser = await storage.getUser();
      const currentUserId = storedUser?.id;

      // Fetch all debts
      const debtsRes: any = await getAllDebts();
      let debts = Array.isArray(debtsRes) ? debtsRes : (debtsRes?.data || []);
      debts.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || a.due_date).getTime();
        const dateB = new Date(b.created_at || b.due_date).getTime();
        return dateB - dateA;
      });

      // Group by day
      const grouped: {[key: string]: TransactionItem[]} = {};
      const dateKeys: string[] = []; 

      debts.forEach((debt: any) => {
        const isLender = currentUserId === debt.lender_id;
        const isBorrower = currentUserId === debt.borrower_id;

        let displayName = "—";
        if (isLender) {
          displayName = debt.borrower_name || `User ${debt.borrower_id}`;
        } else if (isBorrower) {
          displayName = debt.lender_name || `User ${debt.lender_id}`;
        }

        let transactionType = "lend";
        if (debt.type === 'NỢ NHÓM') {
          transactionType = "group";
        } else if (debt.type === 'muon') {
          transactionType = isBorrower ? "borrow" : "lend";
        } else if (debt.type === 'cho_muon') {
          transactionType = isLender ? "lend" : "borrow";
        }

        const dateObj = new Date(debt.created_at || debt.due_date);
        const dayKey = dateObj.toLocaleDateString('vi-VN'); // dd/mm/yyyy

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

      // Convert to sections (Dùng dateKeys để giữ thứ tự sort)
      const sections: SectionData[] = dateKeys.map(day => ({
        title: day,
        data: grouped[day],
      }));

      setListByDay(sections);
    } catch (error) {
      console.error('Error fetching data:', error);
      setListByDay([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const renderTransactionItem = ({ item }: { item: TransactionItem }) => {
    const moneyColor = item.type === 'borrow' ? '#FF424F' : '#4285F4'; 
    const typeText = item.type === 'borrow' ? 'Mượn nợ' : item.type === 'group' ? 'Chi tiêu nhóm' : 'Cho mượn';

    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        activeOpacity={0.8}
        onPress={() => {
          // Navigate to transaction detail
          // Since we don't have full debt data here, just pass id and let detail fetch
          router.push({
            pathname: '/transaction-detail',
            params: { id: item.id }
          });
        }}
      >
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
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>  
        <View style={{flex: 1, backgroundColor: '#2F2E2E'}}>
          {isLoading ? (
          <ActivityIndicator size="large" color="#3275F1" style={{marginTop: 20}} />
        ) : (
          <SectionList
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            sections={listByDay}
            keyExtractor={(item, index) => item.id + index}
            renderItem={renderTransactionItem}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={() => (
                <Text style={{color: '#A0A0A0', textAlign: 'center', marginTop: 20}}>
                    Không có giao dịch nào gần đây
                </Text>
            )}
          />
        )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default RecentScreen

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#2F2E2E'
  },
  sectionHeader: {
    color: '#D3D3D3',
    fontSize: 15,
    fontFamily: 'Roboto',
    fontWeight: '400',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#4A4A4A',
    marginHorizontal: 15,
    marginBottom: 13,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  avatarContainer: { 
    marginRight: 15 
  },
  avatar: { 
    width: Dimensions.get('window').width * 0.14, 
    height: Dimensions.get('window').width * 0.14, // Fix height to match width for square/circle
    borderRadius: 20, 
    backgroundColor: '#FFF' 
  },
  infoContainer: { 
    flex: 1 
  },
  nameText: { 
    color: '#FFF', 
    fontWeight: '500', 
    fontSize: 15, 
    fontFamily: 'Roboto' 
  },
  noteText: { 
    color: '#A0A0A0', 
    fontSize: 13, 
    fontFamily: 'Roboto', 
    fontWeight: '300', 
    marginTop: 4 
  },
  moneyContainer: { 
    alignItems: 'flex-end',
    minWidth: 80 
  },
  typeText: { 
    color: '#FFF', 
    fontSize: 12, 
    fontFamily: 'Roboto', 
    fontWeight: '500', 
    marginBottom: 4 
  },
  amountText: { 
    fontFamily: 'Roboto', 
    fontWeight: '700', 
    fontSize: 15 
  },
})