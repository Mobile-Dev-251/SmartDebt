import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const transaction_list = [
  {
    title: "Ngày 7, tháng 11, năm 2025",
    data: [
      { id: '3', title: 'Tiền trà sữa', type: 'Mượn nợ', amount: '50.000đ', isDebt: true },
    ],
  },
  {
    title: "Ngày 5, tháng 11, năm 2025",
    data: [
      { id: '1', title: 'Tiền trà sữa', type: 'Mượn nợ', amount: '50.000đ', isDebt: true },
      { id: '2', title: 'Tiền ăn trưa', type: 'Cho mượn', amount: '50.000đ', isDebt: false },
    ],
  },
  {
    title: "Ngày 3, tháng 11, năm 2025",
    data: [
      { id: '3', title: 'Tiền trà sữa', type: 'Mượn nợ', amount: '50.000đ', isDebt: true },
    ],
  },
  {
    title: "Ngày 2, tháng 11, năm 2025",
    data: [
      { id: '3', title: 'Tiền trà sữa', type: 'Mượn nợ', amount: '50.000đ', isDebt: true },
    ],
  },
  {
    title: "Ngày 1, tháng 11, năm 2025",
    data: [
      { id: '3', title: 'Tiền trà sữa', type: 'Mượn nợ', amount: '50.000đ', isDebt: true },
    ],
  },
];

const TransUserScreen = () => {
  const item = useLocalSearchParams();
  const [userType, setUserType] = useState((item.type as string) || "");
  const [type, setType] = useState("unsaved");
  const [showMenu, setShowMenu] = useState(false);
  const [showGroupOption, setShowGroupOption] = useState(false);
  const router = useRouter();

  const details_choices = [
    { label: 'Hủy lưu', value: 'unsaved' }
  ];

  const renderItem = ({ item: transaction }: any) => (
    <View style={styles.transactionCard}>
      <Image 
        source={{ uri: 'https://avatar.iran.liara.run/public/boy' }} 
        style={styles.cardAvatar} 
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name || "Không thể tìm thấy tên"}</Text>
        <Text style={styles.cardSubTitle}>{transaction.title}</Text>
      </View>
      <View style={styles.cardAmountContainer}>
        <Text style={styles.cardType}>{transaction.type}</Text>
        <Text style={[styles.cardAmount, { color: transaction.isDebt ? '#FF5050' : '#50ADFF' }]}>
          {transaction.amount}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
            <Text style={styles.profileName}>{item.name || "Hoàng Phương Bình"}</Text>
            
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
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: width * 0.0681,
    textAlign: 'center',
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