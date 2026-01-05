import React, { useState, useEffect} from 'react'
import { Dimensions, StyleSheet, Text, View, SectionList, ActivityIndicator, Image } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'

interface TransactionItem {
  id: string;
  name: string;
  note: string;
  amount: string;
  type: string;
}

interface SectionData {
  title: string;
  data: TransactionItem[];
}

const RecentScreen = () => {
  const [listByDay, setListByDay] = useState<SectionData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = () => {
    // TODO: Replace with actual API call
    setListByDay([]);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const renderTransactionItem = ({ item }: { item: TransactionItem }) => {
    const moneyColor = item.type === 'borrow' ? '#FF424F' : '#4285F4'; 
    const typeText = item.type === 'borrow' ? 'Mượn nợ' : 'Cho mượn';

    return (
      <View style={styles.itemContainer}>
        <View style={styles.avatarContainer}>
           <Image 
             source={require('../../assets/images/avatar.png')} 
             style={styles.avatar} 
           />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
        <View style={styles.moneyContainer}>
          <Text style={styles.typeText}>{typeText}</Text>
          <Text style={[styles.amountText, { color: moneyColor }]}>{item.amount}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>  
        <View style={{flex: 1, backgroundColor: '#2F2E2E'}}>
          {isLoading ? (
          <ActivityIndicator size="large" color="#fff" />
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
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Roboto',
    fontSize: 30,
    fontWeight: 'bold', 
    textAlign: 'center',
    marginTop: 0.05 * Dimensions.get('window').height
  },
  sectionHeader: {
    color: '#D3D3D3',
    fontSize: 15,
    fontFamily: 'Roboto',
    fontWeight: 'regular',
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
    height: Dimensions.get('window').height * 0.08, 
    borderRadius: 20, 
    backgroundColor: '#FFF' 
  },
  infoContainer: { 
    flex: 1 
  },
  nameText: { 
    color: '#FFF', 
    fontWeight: 'medium', 
    fontSize: 15, 
    fontFamily: 'Roboto' 
  },
  noteText: { 
    color: '#A0A0A0', 
    fontSize: 15, 
    fontFamily: 'Roboto', 
    fontWeight: 'light', 
    marginTop: 4 
  },
  moneyContainer: { 
    alignItems: 'flex-end' 
  },
  typeText: { 
    color: '#FFF', 
    fontSize: 15, 
    fontFamily: 'Roboto', 
    fontWeight: 'medium', 
    marginBottom: 4 
  },
  amountText: { 
    fontFamily: 'Roboto', 
    fontWeight: 'bold', 
    fontSize: 15 
  },
})