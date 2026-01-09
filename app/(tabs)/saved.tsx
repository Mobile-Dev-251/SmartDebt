import { spacingX } from '@/constants/theme';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SearchContext } from '../contexts/searchContext'; // Đảm bảo đường dẫn import đúng
import { getAllContacts } from '@/service/contactsService';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
// Đã xóa các import không cần thiết: debtsService, groupsService

interface InfoItem {
  id: string,
  name: string
}

interface SectionData {
  title: string,
  data: InfoItem[]
}

const SavedScreen = () => {
  const { searchText } = useContext(SearchContext);
  const [fullData, setFullData] = useState<SectionData[]>([]);
  const [displayData, setDisplayData] = useState<SectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: authUser } = useSelector((state: RootState) => state.auth);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // --- CHỈ LẤY DANH SÁCH LIÊN HỆ ĐÃ LƯU ---
      // Không gọi getMyGroups hay getAllDebts nữa -> App sẽ nhanh hơn hẳn
      const response: any = await getAllContacts();
      const contacts = Array.isArray(response) ? response : (response.data || response.contacts || []);
      
      const groupedData: { [key: string]: InfoItem[] } = {};

      if (Array.isArray(contacts)) {
        contacts.forEach((contact: any) => {
          const displayName = contact.name;
          const targetId = contact.user_id_contact || contact.id;

          // --- BỘ LỌC QUAN TRỌNG ---
          // Chỉ hiện những người có tên đàng hoàng.
          // Nếu tên rỗng, null, hoặc "Không tên" -> Bỏ qua luôn (Không hiện User 9)
          if (!displayName || displayName === "Không tên" || displayName.trim() === "") {
             return; 
          }

          // Phân nhóm theo chữ cái đầu (A, B, C...)
          const firstLetter = displayName.charAt(0).toUpperCase();
          const groupKey = /^[A-ZÀ-Ỹ]$/i.test(firstLetter) ? firstLetter : '#';

          if (!groupedData[groupKey]) {
            groupedData[groupKey] = [];
          }
          
          groupedData[groupKey].push({
            id: targetId ? String(targetId) : String(contact.id), 
            name: displayName
          });
        });
      }

      // Sắp xếp các nhóm A -> Z
      const sections: SectionData[] = Object.keys(groupedData).sort().map(key => ({
        title: key,
        data: groupedData[key]
      }));

      setFullData(sections);
      setDisplayData(sections);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (authUser) {
        fetchData();
      }
    }, [authUser])
  );

  useEffect(() => {
    if (!searchText || searchText.trim() === '') {
        setDisplayData(fullData);
        return;
    }
    const lowerText = searchText.toLowerCase();

    const filtered = fullData.map(section => {
        const filteredItems = section.data.filter(item => 
            item.name.toLowerCase().includes(lowerText)
        );
        return { ...section, data: filteredItems };
    })
    .filter(section => section.data.length > 0);

    setDisplayData(filtered);

  }, [searchText, fullData]);

  const renderInfoItem = ({ item }: { item: InfoItem }) => {
    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        onPress={()=>
        {
          router.push({
            pathname: '/trans_user_profile/[id]',
            params: {
              id: item.id,
              name: item.name,
              type: 'user'
            } 
          })
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
          <View> 
            <Text style={styles.noteText}>
              Giao dịch gần đây {'>'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "#2F2E2E" }}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#3275F1"
              style={{ marginTop: 20 }}
            />
          ) : (
            <SectionList
              stickySectionHeadersEnabled={false}
              showsVerticalScrollIndicator={false}
              sections={displayData}
              keyExtractor={(item, index) => item.id + index}
              renderItem={renderInfoItem}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionHeader}>{title}</Text>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={() => (
                <Text
                  style={{ color: "white", textAlign: "center", marginTop: 20 }}
                >
                  Chưa có liên hệ nào được lưu
                </Text>
              )}
            />
          )}
          <TouchableOpacity
            style={styles.addNew}
            onPress={() => {
              router.push({
                pathname: "/screen/select-screen",
                params: {
                  type: "user",
                },
              });
            }}
          >
            <AntDesign name="plus" size={35} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default SavedScreen

const styles = StyleSheet.create({
  itemContainer: {
    marginHorizontal: Dimensions.get('window').width * 0.05,
    marginTop: 15,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E3E3E',
    padding: 10,
    borderRadius: 12
  },
  sectionHeader: {
    marginHorizontal: Dimensions.get('window').width * 0.05,
    marginTop: 20,
    fontWeight: '600',
    color: '#8A8A8A',
    fontSize: 16
  },
  avatarContainer: { marginRight: 15 },
  avatar: { 
    width: Dimensions.get('window').width * 0.12, 
    height: Dimensions.get('window').width * 0.12,
    borderRadius: 20, 
    backgroundColor: '#FFF' 
  },
  infoContainer: {
    flexDirection: 'column',
    flex: 1
  },
  nameText: { 
    color: '#FFF', 
    fontFamily: 'Roboto', 
    fontWeight: '500', 
    fontSize: 16 
  },
  noteText: { 
    color: '#A0A0A0', 
    fontFamily: 'Roboto', 
    fontWeight: '300', 
    fontSize: 13, 
    marginTop: 4 
  },
  addNew:   {
    position: 'absolute', 
    backgroundColor: '#3275F1', 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    right: 20,
    bottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }
})