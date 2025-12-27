import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';

const addTransactionScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [userName, setUserName] = useState((params.userName as string) || "");
  const [userType, setUserType] = useState((params.type as string) || "");
  const [isSaved, setSaved] = useState(true);
  const [isRepeat, setRepeat] = useState(false);
  const [amount, setAmount] = useState("50.000");
  const [note, setNote] = useState("");

  const [type, setType] = useState("muon");
  const [reminder, setReminder] = useState("1_day");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const typeData = [
    { label: 'Mượn nợ', value: 'muon' },
    { label: 'Cho mượn', value: 'cho_muon' },
  ];

  const reminderData = [
    { label: 'Trước 1 ngày', value: '1_day' },
    { label: 'Trước 3 ngày', value: '3_days' },
    { label: 'Trước 1 tuần', value: '1_week' },
    { label: 'Trước 1 tháng', value: '1_month' },
  ];

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={30} color="#FFFFFF"/>
          </TouchableOpacity>
          <Text style={styles.header}>Tạo mới giao dịch</Text>
          <View style={styles.infoButton} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Họ và tên */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput style={styles.input} value={userName} onChangeText={setUserName} placeholderTextColor="#888" />

            {userType == 'user' && ( 
              <View style={styles.checkboxContainer}>
                <Checkbox style={styles.checkbox} value={isSaved} onValueChange={setSaved} color={isSaved ? '#3875F6' : undefined} />
                <Text style={styles.checkboxLabel}>Lưu vào danh sách</Text>
              </View>
            )}
            </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại</Text>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              itemTextStyle={styles.itemText}
              selectedTextStyle={styles.selectedText}
              activeColor={'#1e1e1e'}
              data={typeData}
              labelField="label"
              valueField="value"
              value={type}
              onChange={item => setType(item.value)}
              renderRightIcon={() => <Ionicons name="chevron-down" size={20} color="#AAA" />}
            />
          </View>

          {/* Ngày trả */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày trả</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.selectedText}>{date.toLocaleDateString('vi-VN')}</Text>
              <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
            )}
          </View>

          {/* Số tiền */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số tiền</Text>
            <View style={styles.amountInputContainer}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={amount} onChangeText={setAmount} keyboardType="numeric" />
              <Text style={styles.currencySymbol}>đ</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hẹn nhắc</Text>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              itemTextStyle={styles.itemText}
              selectedTextStyle={styles.selectedText}
              activeColor={'#333'}
              data={reminderData}
              labelField="label"
              valueField="value"
              value={reminder}
              onChange={item => setReminder(item.value)}
              renderRightIcon={() => <Ionicons name="chevron-down" size={20} color="#AAA" />}
            />
          </View>

          {/* Lặp lại */}
          <View style={[styles.checkboxContainer, { marginTop: 10 }]}>
            <Checkbox style={styles.checkbox} value={isRepeat} onValueChange={setRepeat} color={isRepeat ? '#3875F6' : undefined} />
            <Text style={styles.checkboxLabel}>Lặp lại</Text>
          </View>

          {/* Ghi chú */}
          <View style={[styles.inputGroup, { marginTop: 20 }]}>
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={note} onChangeText={setNote} placeholder="..." placeholderTextColor="#888" />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Tạo mới</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default addTransactionScreen

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#2F2E2E' 
  },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 5 
  },
  header: { 
    flex: 1, 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 22,
    textAlign: 'center' 
  },
  backButton: { 
    width: 50, 
    paddingLeft: 10 
  },
  infoButton: { 
    width: 50 
  },
  scrollContent: { 
    padding: 20 
  },
  inputGroup: { 
    marginBottom: 20 
  },
  label: { 
    color: '#fff', 
    fontSize: 16,
    fontWeight: '600', 
    marginBottom: 10 
  },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 12,
    color: '#fff',
    padding: 12,
    fontSize: 16,
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
  amountInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    position: 'relative' 
  },
  currencySymbol: { 
    position: 'absolute', 
    right: 15, 
    color: '#AAA', 
    fontSize: 18 
  },
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 8 
  },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderRadius: 4 
  },
  checkboxLabel: { 
    color: '#AAA', 
    marginLeft: 10, 
    fontSize: 14 
  },
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  footer: { 
    padding: 20, 
    backgroundColor: '#262626' 
  },
  submitBtn: { 
    backgroundColor: '#3875F6', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  submitBtnText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
})