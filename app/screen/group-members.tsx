import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setCurrentRoute } from '@/store/progress';

interface Member {
  id: string;
  name: string;
  lastTransaction?: string;
}

interface SectionData {
  title: string;
  data: Member[];
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
      // Replace URL with your backend endpoint
      const res = await fetch(`https://your-backend.example.com/api/groups/${groupId}/members`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      // expected data shape: [{ id, name, lastTransaction? }, ...]
      setSections([{ title: 'Thành viên', data }]);
    } catch (err) {
      // Fallback to mock data if backend not available
      const mock: SectionData[] = [
        {
          title: 'Thành viên',
          data: [
            { id: '1', name: 'Antony', lastTransaction: 'Giao dịch gần đây' },
            { id: '2', name: 'Benjamin', lastTransaction: 'Giao dịch gần đây' },
            { id: '3', name: 'Nguyễn Văn A', lastTransaction: 'Giao dịch gần đây' },
          ],
        },
      ];
      setSections(mock);
      // optional: setError('Không thể tải dữ liệu. Hiển thị dữ liệu mẫu.');
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

  const renderItem = ({ item }: { item: Member }) => (
    <TouchableOpacity style={styles.memberRow} onPress={() => openMember(item)}>
      <Image source={require('../../assets/images/avatar.png')} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberSub}>{item.lastTransaction || ''} {'>'}</Text>
      </View>
    </TouchableOpacity>
  );

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
            <ActivityIndicator style={{ marginTop: 20 }} />
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
            // renderSectionHeader={({ section: { title } }) => (
            //   <Text style={styles.sectionHeader}>{title}</Text>
            // )}
            ListEmptyComponent={() => <Text style={{ color: '#fff' }}>Không có thành viên</Text>}
            contentContainerStyle={{ paddingBottom: 140 }}
          />
        )}

      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={() => {}}>
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
  addBtn: { 
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