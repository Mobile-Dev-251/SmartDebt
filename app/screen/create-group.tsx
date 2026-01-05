import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setCurrentRoute } from '@/store/progress';
import { useDispatch } from 'react-redux';

interface SavedUser {
  id: string;
  name: string;
}

interface SectionData {
  title: string;
  data: SavedUser[];
}

const screen_width = Dimensions.get('window').width

const CreateGroupScreen = () => {
  const PAGE_ID = 'create-group';
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const userId = (params.userId as string) || '';

  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // Selected list

  useEffect(() => {
    const fetchSavedUsers = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      // TODO: Replace with actual API call
      setSections([]);
      setIsLoading(false);
    };

    fetchSavedUsers();
  }, [userId]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  };

  // Filter sections by search text
  const filteredSections = sections
    .map(s => ({ ...s, data: s.data.filter(d => d.name.toLowerCase().includes(searchText.toLowerCase())) }))
    .filter(s => s.data.length > 0);

  const handleCreate = () => {
    // Handle group creation: send groupName + selected members + ownerId (userId) to DB
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Tạo nhóm</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={{ padding: 16, paddingBottom: 120 }}>
        {/* {!userId && (
          <Text style={{ color: 'white', marginBottom: 10 }}>
            Không tìm thấy thông tin người dùng. Vui lòng đăng nhập để tạo nhóm.
          </Text>
        )} */}

        <Text style={styles.label}>Tên nhóm</Text>
        <TextInput placeholder="Đặt tên nhóm" placeholderTextColor="#999" value={groupName} onChangeText={setGroupName} style={styles.nameInput} />

        <Text style={[styles.label, { marginTop: 16 }]}>Thêm thành viên</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#fff" style={{ marginLeft: 13, marginRight: 4 }} />
          <TextInput
            placeholder="Tìm kiếm"
            placeholderTextColor="#FFFFFF88"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : (
          <SectionList
            sections={filteredSections}
            keyExtractor={(item, idx) => item.id + idx}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.memberItem} onPress={() => toggleSelect(item.id)}>
                <View style={styles.selectWrap}>
                  {selectedIds.includes(item.id) ? (
                    <View style={styles.selectedCircle}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  ) : (
                    <View style={styles.unselectedCircle} />
                  )}
                </View>

                <Image source={require('../../assets/images/avatar.png')} style={styles.avatar} />
                <Text style={styles.memberName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
            ListEmptyComponent={() => (
              <Text style={{ color: '#fff', marginTop: 8 }}>
                {userId ? 'Không có thành viên đã lưu.' : 'Bạn cần đăng nhập để xem danh sách thành viên.'}
              </Text>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      <View style={styles.footer}> 
        <TouchableOpacity style={styles.createBtnFixed} onPress={handleCreate}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Tạo nhóm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreateGroupScreen;

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
  title: { 
    flex: 1, 
    textAlign: 'center', 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 25 
  },
  label: { 
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8 
  },
  nameInput: { 
    backgroundColor: 'transparent', 
    padding: 12, 
    borderRadius: 12, 
    color: '#fff',
    borderWidth: 1, 
    borderColor: '#666' 
  },
  input: { 
    backgroundColor: '#1E1E1E', 
    padding: 12, 
    borderRadius: 12, 
    color: '#fff' 
  },
  searchContainer: { 
    flexDirection: 'row',
    alignItems: 'center', 
    backgroundColor: '#242323', 
    borderRadius: 18, 
    height: 40, 
    marginTop: 8, 
    marginBottom: 12 
  },
  searchInput: { 
    flex: 1, 
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 15, 
    fontWeight: 'ultralight',
    paddingHorizontal: 4 
  },
  sectionHeader: { 
    color: '#fff',
    fontSize: 20, 
    fontWeight: 'bold', 
    marginTop: 12, 
    marginBottom: 8 
  },
  memberItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10 
  },
  selectWrap: { 
    width: 34, 
    alignItems: 'center' 
  },
  unselectedCircle: { 
    width: 20, 
    height: 20, 
    borderRadius: 20, 
    borderWidth: 1.5, 
    borderColor: '#FFFFFF33' 
  },
  selectedCircle: { 
    width: 24, 
    height: 24, 
    borderRadius: 20, 
    backgroundColor: '#3875F6', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  avatar: { 
    width: screen_width * 0.1159, 
    height: screen_width * 0.1159, 
    borderRadius: 1000, 
    marginLeft: 12,
    marginRight: 12, 
    backgroundColor: '#fff' 
  },
  memberName: { 
    color: '#fff', 
    fontSize: 18
  },
  createBtn: { 
    backgroundColor: '#3875F6', 
    padding: 14, 
    borderRadius: 10, 
    alignItems: 'center',
    marginTop: 20 
  },
  footer: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    bottom: 0,
    flex: 1, 
    backgroundColor: '#050404ff'
  },
  createBtnFixed: { 
    backgroundColor: '#3875F6', 
    padding: 14, 
    borderRadius: 10, 
    marginVertical: 7, 
    alignItems: 'center', 
    alignSelf: 'center',
    height: 52 ,
    width: screen_width * 0.7295
  }
});