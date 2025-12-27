import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { scale } from '@/utils/stylings';
import React, {useState, createContext} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Dimensions, ScrollViewComponent, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import EvilIcons from '@expo/vector-icons/EvilIcons';

import GroupScreen from './group';
import RecentScreen from './recent';
import SavedScreen from './saved';

export const SearchContext = createContext('');   
const navbar = createMaterialTopTabNavigator();

export default function TransactionScreen() {
  const [searchText, setSearchText] = useState('');

    return (
        <SearchContext.Provider value={searchText}>
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
                <TouchableOpacity style = {styles.notifyButton}>
                  <FontAwesome5 name="bell" size={24} color="white" />
                </TouchableOpacity>
              </View>
                
              <navbar.Navigator
                  screenOptions={{
                  tabBarActiveTintColor: '#3275F1',
                  tabBarInactiveTintColor: '#FFFFFF',
                  tabBarLabelStyle: {fontFamily: 'Roboto', fontSize: 18, fontWeight: 'bold'},
                  tabBarStyle: {backgroundColor: '#2F2E2E'}
                  }}>
                  <navbar.Screen name="Gần đây" component={RecentScreen} />
                  <navbar.Screen name="Đã lưu" component={SavedScreen} />
                  <navbar.Screen name="Nhóm" component={GroupScreen} />
              </navbar.Navigator>
            </View>
        </SearchContext.Provider>
    )
};

const styles = StyleSheet.create({
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
        marginHorizontal: 10
      },
      searchContainer: {
        flexDirection: 'row',
        marginTop: spacingY._15,
        marginBottom: spacingY._15
      },
      iconWrapper: {
        marginRight: spacingX._3,
      },
      icon: {
        fontSize: scale(20),
        color: colors.Neutral100,
      },
      input: {
        flex: 1,
        fontSize: scale(15),
        fontFamily: 'RobotoRegular',
        fontWeight: '400',
        color: '#FFFFFF',
        paddingVertical: 0,
      },
      notifyButton: {
        backgroundColor: '#777777',
        flex: 1,
        borderRadius: '100%',
        alignItems: 'center',
        justifyContent: 'center'
      }
}) 