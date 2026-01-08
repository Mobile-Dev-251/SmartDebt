import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { scale } from '@/utils/stylings';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchContext } from '../contexts/searchContext';
import { useDispatch } from 'react-redux';
import { getAllContacts } from '@/service/contactsService';

interface InfoItem {
  id: string,
  name: string,
  note?: string
}

interface SectionData {
  title: string,
  data: InfoItem[]
}

const avatar_width = Dimensions.get('window').width * 0.1159;

const SelectScreen = () => {
  const PAGE_ID = 'select-screen';
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const addType = (params.type as string) || 'user';
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<SectionData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response: any = await getAllContacts();
        const contactsList = Array.isArray(response) ? response : (response.data || response.contacts || []);
        
        // Group by first letter of name
        const grouped: { [key: string]: InfoItem[] } = {};
        contactsList.forEach((contact: any) => {
          const firstLetter = contact.name ? contact.name.charAt(0).toUpperCase() : '#';
          if (!grouped[firstLetter]) {
            grouped[firstLetter] = [];
          }
          grouped[firstLetter].push({
            id: contact.id.toString(),
            name: contact.name || 'Không tên',
            note: contact.phone || ''
          });
        });

        const sectionsData: SectionData[] = Object.keys(grouped).sort().map(letter => ({
          title: letter,
          data: grouped[letter]
        }));

        setSections(sectionsData);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setSections([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [addType]);

  const onSelect = (item: InfoItem) => {
    router.push({
      pathname: '/screen/add-transaction',
      params: {
        userName: item.name,
        type: addType,
        id: item.id
      }
    })
  }

  return (
     <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            router.push('/(tabs)/transaction?tab=saved');
          }}>
            <Ionicons name="chevron-back-outline" size={30} color="#FFFFFF"/>
          </TouchableOpacity>
          <Text style={styles.header}>Tạo mới giao dịch</Text>
          <View style={styles.infoButton} />
        </View>

        <SearchContext.Provider value={{ searchText, setSearchText }}>
            <View style={{flex: 1, backgroundColor: '#2F2E2E'}}>
              <View style = {styles.searchContainer}>
                <View style = {styles.inputContainer}>
                  <View style={styles.iconWrapper}>
                    <EvilIcons name="search" size={20} color="white" />
                  </View>
                  <TextInput 
                      placeholder = 'Tìm kiếm'
                      style = {styles.input}
                      placeholderTextColor='#FFFFFF'
                      value={searchText}
                      onChangeText={(text) => setSearchText(text)}
                  />
                </View>
              </View>

              {isLoading ? (
                <ActivityIndicator style={{marginTop: 20}} />
              ) : (
                <SectionList
                  stickySectionHeadersEnabled = {false}
                  showsVerticalScrollIndicator = {false}
                  sections={sections}
                  keyExtractor={(item, index) => item.id + index}
                  renderItem={({item}) => (
                    <TouchableOpacity style={styles.itemContainer} onPress={() => onSelect(item)}>
                      <Image 
                        source={require('../../assets/images/avatar.png')} 
                        style={styles.avatar} 
                      />
                      <Text style={styles.nameText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  renderSectionHeader={() => (
                    <Text style={styles.sectionHeader}>Đã lưu</Text>
                  )}
                  ListEmptyComponent={() => (
                      <Text style={{color: 'white', textAlign: 'center', marginTop: 20}}>
                          Không tìm thấy kết quả
                      </Text>
                  )}
                />
              )}
            </View>
        </SearchContext.Provider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default SelectScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2F2E2E' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5 },
  header: { flex: 1, color: '#FFFFFF', fontWeight: 'bold', fontSize: 27, textAlign: 'center' },
  backButton: { width: 50, paddingLeft: 10 },
  infoButton: { width: 50 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#242323',
    borderRadius: radius._30,
    paddingHorizontal: spacingX._20,
    height: Dimensions.get('window').width * 0.1,
    width: Dimensions.get('window').width * 0.833,
    backgroundColor: '#242323',
    marginHorizontal: 10,
    flex: 1
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: spacingY._15,
    marginBottom: spacingY._15
  },
  iconWrapper: {
    marginRight: spacingX._3,
  },
  input: {
    flex: 1,
    fontSize: scale(15),
    fontFamily: 'Roboto',
    fontWeight: 'ultralight',
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  itemContainer: {
    marginHorizontal: Dimensions.get('window').width * 0.08,
    marginTop: Dimensions.get('window').width * 0.04,
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: spacingX._20,
    marginTop: Dimensions.get('window').height * 0.023,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 20
  },
  avatar: { 
    width: avatar_width, 
    height: avatar_width, 
    borderRadius: 1000, 
    backgroundColor: '#FFF'
  },
  infoContainer: {
    flexDirection: 'column'
  },
  nameText: { 
    marginLeft: Dimensions.get('window').width * 0.05,
    alignSelf: 'center',
    flex: 1,
    color: '#FFF', 
    fontSize: 20,
    fontWeight: 'medium'
  },
  noteText: { color: '#A0A0A0', fontSize: 13, marginTop: 4 },
})