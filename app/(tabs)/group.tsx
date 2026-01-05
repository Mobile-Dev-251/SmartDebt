import { spacingX } from '@/constants/theme';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SearchContext } from './transaction';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface InfoItem {
  id: string,
  name: string,
  note: string
}

interface SectionData {
  title: string,
  data: InfoItem[]
}

const GroupScreen = () => {
  const searchText = useContext(SearchContext);
  const [fullData, setFullData] = useState<SectionData[]>([]);
  const [displayData, setDisplayData] = useState<SectionData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const auth = useSelector((state: RootState) => state.auth);
  const userId = auth.user;

  const fetchData = () => {
    // TODO: Replace with actual API call
    setFullData([]);   
    setDisplayData([]); 
    setIsLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

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
      <View style={styles.itemContainer}>
        <View style={styles.avatarContainer}>
            <Image 
              source={require('../../assets/images/avatar.png')} 
              style={styles.avatar} 
            />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}> {item.name} </Text>
          <TouchableOpacity onPress={()=>{router.push({
            pathname: '/trans_user_profile/[id]',
            params: {
              id: item.id,
              name: item.name,
              type: 'group'
            }
          })}}> 
            <Text style={styles.noteText}>
              {item.note}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>  
        <View style= {{flex: 1, backgroundColor: '#2F2E2E'}}>
          {
            isLoading? (
              <ActivityIndicator></ActivityIndicator>
            ) : (
              <SectionList 
                stickySectionHeadersEnabled= {false}
                showsVerticalScrollIndicator = {false}
                sections={displayData}
                keyExtractor={(item, index) => item.id + index}
                renderItem={renderInfoItem}
                renderSectionHeader={({ section: { title } }) => (
                  <Text style={styles.sectionHeader}>{title}</Text>
                )}
                ListEmptyComponent={() => (
                    <Text style={{color: 'white', textAlign: 'center', marginTop: 20}}>
                        Không tìm thấy kết quả
                    </Text>
                )}
              />
            )
          }
          <TouchableOpacity style={styles.addNew} onPress={ () => {
            router.push({
                pathname: '/screen/create-group',
                params: {
                  userId: userId ?? ''
                }
              });
          }}>
            <AntDesign name="plus" size={35} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default GroupScreen

const styles = StyleSheet.create({
  itemContainer: {
    marginHorizontal: Dimensions.get('window').width * 0.08,
    marginTop: Dimensions.get('window').width * 0.04,
    flexDirection: 'row',
  },
  sectionHeader: {
    marginHorizontal: Dimensions.get('window').width * 0.08,
    marginTop: Dimensions.get('window').height * 0.023,
    fontFamily: 'Roboto',
    fontWeight: 'semibold',
    color: '#FFFFFF',
    fontSize: 20
  },
  avatarContainer: { marginRight: 15 },
  avatar: { 
    width: Dimensions.get('window').width * 0.14, 
    height: Dimensions.get('window').height * 0.08, 
    borderRadius: 20, 
    backgroundColor: '#FFF' 
  },
  infoContainer: {
    flexDirection: 'column'
  },
  nameText: { 
    color: '#FFF', 
    fontWeight: 'medium', 
    fontSize: 20, 
    fontFamily: 'Roboto' 
  },
  noteText: { 
    color: '#A0A0A0', 
    fontSize: 13, 
    fontFamily: 'Roboto', 
    fontWeight: 'light',
    marginTop: 4 
  },
  addNew:   {
    position: 'absolute', 
    backgroundColor: '#3275F1', 
    width: 60, 
    height: 60, 
    borderRadius: 100, 
    right: spacingX._15,
    bottom: 30,
    alignItems: 'center',
    justifyContent: 'center'
  }
})