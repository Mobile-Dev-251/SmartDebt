import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useDebugValue, useEffect, useState, useCallback } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { UserProfile, setCurrentRoute } from '@/store/progress';
import { RootState } from '@/store/store';
import { getAllDebts } from '@/service/debtsService';
import { storage } from '@/utils/storage';

const { width } = Dimensions.get('window');

const TransUserScreen = () => {
  const PAGE_ID = '[id]';
  const dispatch = useDispatch();
  const item = useLocalSearchParams();
  const [userType, setUserType] = useState((item.type as string) || "");
  const [type, setType] = useState("unsaved");
  const [showMenu, setShowMenu] = useState(false);
  const [showGroupOption, setShowGroupOption] = useState(false);
  const [transaction_list, setTransaction_list] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { prevRoute } = useSelector((state: RootState) => state.progress)

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const targetId = Array.isArray(item.id) ? item.id[0] : item.id;
        const targetName = Array.isArray(item.name) ? item.name[0] : item.name;
        
        // 1. Get current user
        let currentUserId: number | null = null;
        const storedUser = await storage.getUser();
        if (storedUser && storedUser.id) {
          currentUserId = storedUser.id;
        }

        // 2. Get all debts
        const debtsRes: any = await getAllDebts();
        const debts: any[] = Array.isArray(debtsRes) ? debtsRes : debtsRes?.data || [];

        // 3. Filter debts involving targetId
        // Assuming targetId corresponds to lender_id or borrower_id in debts
        // Note: item.id might be string, debt IDs are numbers usually. 
        // We need to match loosely.

        const filteredDebts = debts.filter((debt: any) => {
            // Check if current user is involved (should be true for all debts returned by getAllDebts usually)
            // And check if targetId user is the OTHER party
            
            if (currentUserId == null) return true; // Can't filter if we don't know who "me" is

            const isMeLender = debt.lender_id === currentUserId;
            const isMeBorrower = debt.borrower_id === currentUserId;

            if (isMeLender) {
                // I lent money. The borrower should be targetId
                return String(debt.borrower_id) === String(targetId);
            } else if (isMeBorrower) {
                // I borrowed money. The lender should be targetId
                return String(debt.lender_id) === String(targetId);
            }
            return false;
        });

        // 4. Group by date
        const groupedData: { [key: string]: any[] } = {};

        filteredDebts.forEach((debt: any) => {
            const dateObj = new Date(debt.created_at || debt.due_date);
            const dateKey = dateObj.toLocaleDateString('vi-VN');
            
            let isDebt = false; // "Nợ" (mình nợ họ) or "Cho vay" (họ nợ mình)
            // Visual logic: 
            // - Blue: Cho mượn (Lend) -> Mình là Lender -> debt.lender_id == currentUserId
            // - Red: Mượn nợ (Borrow) -> Mình là Borrower -> debt.borrower_id == currentUserId
            
            if (currentUserId != null && debt.borrower_id === currentUserId) {
                isDebt = true; // Mình nợ -> Red
            }

            if (!groupedData[dateKey]) {
                groupedData[dateKey] = [];
            }
            
            groupedData[dateKey].push({
                id: String(debt.id),
                title: debt.title || debt.note || "Giao dịch",
                amount: `${Number(debt.amount).toLocaleString('vi-VN')}đ`,
                type: isDebt ? "Mượn nợ" : "Cho mượn",
                isDebt: isDebt,
                date: dateObj
            });
        });

        // Sort keys and data
        const sortedKeys = Object.keys(groupedData).sort((a, b) => {
            const partsA = a.split('/');
            const partsB = b.split('/');
            const dateA = new Date(Number(partsA[2]), Number(partsA[1]) - 1, Number(partsA[0]));
            const dateB = new Date(Number(partsB[2]), Number(partsB[1]) - 1, Number(partsB[0]));
            return dateB.getTime() - dateA.getTime();
        });

        const sections = sortedKeys.map(key => ({
            title: key,
            data: groupedData[key].sort((a,b) => b.date.getTime() - a.date.getTime())
        }));

        setTransaction_list(sections);

    } catch (e) {
        console.error("Error fetching transactions for user:", e);
    } finally {
        setIsLoading(false);
    }
  };

  useFocusEffect(
      useCallback(() => {
          if (item.id) {
            fetchData();
          }
      }, [item.id])
  );

  useEffect(() => {
    // Không lưu currentRoute cho screen này
  }, [item.name, dispatch]);

  const renderItem = ({ item: transaction }: any) => {
    const moneyColor = transaction.isDebt ? '#FF424F' : '#4285F4';

    return (
      <TouchableOpacity 
        style={styles.transactionCard}
        onPress={() => {
          router.push({
            pathname: '/transaction-detail',
            params: { id: transaction.id }
          });
        }}
      >
        <View style={styles.cardAvatarContainer}>
          <Image 
            source={require('../../assets/images/avatar.png')} 
            style={styles.cardAvatar} 
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name || "Không tên"}</Text>
          <Text style={styles.cardSubTitle} numberOfLines={1}>{transaction.title}</Text>
        </View>
        <View style={styles.cardAmountContainer}>
          <Text style={styles.cardType}>{transaction.type}</Text>
          <Text style={[styles.cardAmount, { color: moneyColor }]}>
            {transaction.amount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          // Nếu khôi phục tiến trình, xác định Tab dựa trên prevRoute hoặc item.type
          let targetTab = 'recent'; 
          if (prevRoute === 'saved' || item.type === 'user') targetTab = 'saved';
          if (prevRoute === 'group' || item.type === 'group') targetTab = 'group';

          // Điều hướng về trang transaction kèm tham số 'tab'
          router.push(`/(tabs)/transaction?tab=${targetTab}`);
        }}>
          <Ionicons name="chevron-back-outline" size={30} color="#FFFFFF"/>
        </TouchableOpacity>
        <Text style={styles.header} pointerEvents="none">{item.type == 'user' ? 'Thông tin' : 'Nhóm'}</Text>
        <View style = {styles.advanceSelection}>
          {(userType === 'group' && 
          <TouchableOpacity style={styles.showGroup} onPress={()=>{
            setShowGroupOption(prev => !prev);
          }}>
            <AntDesign name="usergroup-add" size={24} color="#fff" />
          </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.infoButton} onPress={()=>{
            setShowMenu(prev => !prev);
          }}>
            <Entypo name="dots-three-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

      </View>


      {showGroupOption && (
        <>
          <Pressable style={styles.overlay} onPress={() => setShowGroupOption(false)} />
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowGroupOption(false); router.push({ pathname: '/screen/group-members', params: { groupId: item.id, groupName: item.name } }); }}>
              <Text style={styles.menuItemText}>Thành viên</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { 
              // TODO: call backend to remove current user from group
              setType('leave_group'); 
              setShowGroupOption(false); 
              alert('Rời khỏi nhóm (demo)');
              }}>
              <Text style={styles.menuItemText}>Rời khỏi nhóm</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {showMenu && (
        <>
          <Pressable style={styles.overlay} onPress={() => setShowMenu(false)} />
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setType('unsaved'); setShowMenu(false); }}>
              <Text style={styles.menuItemText}>Hủy lưu</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <SectionList
        sections={transaction_list}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.profileSection}>
            <Image 
              source={{ uri: 'https://avatar.iran.liara.run/public/boy' }} 
              style={styles.largeAvatar} 
            />
            <Text style={styles.profileName}>{item.name || "Không có tên"}</Text>
            
            <TouchableOpacity style={styles.addBtn} onPress={() => {
              router.push({
                pathname: '/screen/add-transaction',
                params: {
                  userId: item.id,
                  userName: item.name,
                  type: item.type
                }
              })
            }}>
              <Text style={styles.addBtnText}>+ Thêm giao dịch</Text>
            </TouchableOpacity>

            <Text style={styles.recentTitle}>Giao dịch gần đây</Text>
             {isLoading && <ActivityIndicator size="small" color="#fff" style={{marginTop: 10}} />}
             {!isLoading && transaction_list.length === 0 && (
                 <Text style={{color: '#888', marginTop: 10}}>Chưa có giao dịch nào với người này</Text>
             )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default TransUserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2E2E', 
  },
  headerContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 5,
    zIndex: 1,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: width * 0.0681,
    textAlign: 'center',
    zIndex: -1,
  },
  backButton: {
    width: Dimensions.get('window').width * 0.1,
    paddingLeft: 10,
  },
  advanceSelection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    width: Dimensions.get('window').width * 0.1,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  showGroup: {
    width: Dimensions.get('window').width * 0.1,
    alignItems: 'flex-end',
  },
  menu: {
    position: 'absolute',
    right: 16,
    top: 56,
    backgroundColor: '#242323',
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 20,
    zIndex: 9999,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 9998,
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuItemText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  largeAvatar: {
    width: width * 0.41,
    height: width * 0.41,
    borderRadius: 2000,
    backgroundColor: '#FFFFFF',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 20,
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#3875F6',
    justifyContent: 'center',
    paddingVertical: 10,
    // paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    width: width * 0.52
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: width * 0.045
  },
  recentTitle: {
    color: '#FFFFFF',
    fontSize: width * 0.045,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: 30,
  },
  sectionHeader: {
    color: '#AAAAAA',
    fontSize: width * 0.034,
    marginTop: 15,
    marginBottom: 10,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#3D3D3D',
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  cardAvatarContainer: {
    marginRight: 12,
  },
  cardAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#EEE',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  cardSubTitle: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  cardAmountContainer: {
    alignItems: 'flex-end',
  },
  cardType: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 4,
  },
  cardAmount: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  transactionItem: {
    backgroundColor: '#3A3A3A',
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    borderRadius: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionType: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  debtColor: {
    color: '#FF5252',
  },
  lendColor: {
    color: '#4285F4',
  },
   
  dropdown: {
    height: 50,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  dropdownContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    borderWidth: 0,
    marginTop: 5,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  itemText: {
    color: '#FFF',
    fontSize: 16,
  },
  selectedText: {
    color: '#FFF',
    fontSize: 16,
  },
  dropdownItem: {
    paddingVertical: 10,
  },
});