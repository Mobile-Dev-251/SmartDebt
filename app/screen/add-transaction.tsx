import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { clearPageProgress, setCurrentRoute, updatePageProgress } from '../../store/progress';
import { createDebt, getAllDebts } from '@/service/debtsService';
import { getMyGroups, createGroupExpense, getGroupMembers } from '@/service/groupsService';
import { getAllContacts, findUserByPhone, createContactByPhone } from '@/service/contactsService'; 
import { storage } from '@/utils/storage';

const AddTransactionScreen = () => {
  const PAGE_ID = 'add-transaction'
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const auth = useSelector((state: any) => state.auth);
  
  const saved = useSelector((s:any) => (s.progress?.pageProgress?.[PAGE_ID]) || {}, shallowEqual);

  const [userName, setUserNameStr] = useState(String(params.userName || saved.userName || ""));
  const [userType, setUserType] = useState((params.type as string) || saved.userType || "");
  const [borrowerId, setBorrowerId] = useState<string | null>((params.id as string) || null);
  const [isSaved, setSaved] = useState(saved.isSaved ?? true);
  const [isRepeat, setRepeat] = useState(saved.isRepeat ?? false);
  const [amount, setAmount] = useState(saved.amount ?? "50000");
  const [note, setNote] = useState(saved.note ?? "");

  const [type, setType] = useState((params.type === 'group' ? 'chi' : saved.type) || "muon");
  const [reminder, setReminder] = useState(saved.reminder ?? "1_day");
  const [date, setDate] = useState(saved.date ? new Date(saved.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [phone, setPhone] = useState(saved.phone || "");
  const [isSaveContact, setIsSaveContact] = useState(saved.isSaveContact ?? false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [isSaveContactDisabled, setIsSaveContactDisabled] = useState(false);
  const [selectedFromContacts, setSelectedFromContacts] = useState(false);

  // Helper function to capitalize
  const capitalizeAfterSpaces = (text: string) => {
    return text.replace(/(\s|^)\w/g, (match) => match.toUpperCase());
  };

  const latestRef = useRef<any>({});
  useEffect(() => {
    latestRef.current = { userName, userType, isSaved, isRepeat, amount, note, type, reminder, date: date.toISOString(), phone, isSaveContact }
  }, [userName, userType, isSaved, isRepeat, amount, note, type, reminder, date, phone, isSaveContact])

  // debounce save
  const saveTimeout = useRef<any>(null);
  const scheduleSave = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      dispatch(updatePageProgress({ pageId: PAGE_ID, data: latestRef.current }))
    }, 400);
  }, [])

  useEffect(() => {
    scheduleSave();
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) };
  }, [userName, userType, isSaved, isRepeat, amount, note, type, reminder, date, phone, isSaveContact, scheduleSave])

  useEffect(() => {
    const onStateChange = (nextState: string) => {
      if (nextState === 'background' || nextState === 'inactive') {
        dispatch(updatePageProgress({ pageId: PAGE_ID, data: latestRef.current }))
        // Không lưu currentRoute cho screen này
      }
    };
    const sub = AppState.addEventListener('change', onStateChange);
    return () => sub.remove();
  }, [])

  useEffect(() => {
    // Không lưu currentRoute cho screen này
    return () => { 
      dispatch(clearPageProgress(PAGE_ID))
    };
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (type === 'chi') {
        const fetchGroups = async () => {
          try {
            const response: any = await getMyGroups();
            const groupsList = Array.isArray(response) ? response : (response.data || response.groups || []);
            setGroups(groupsList);
          } catch (error) {
            console.error('Error fetching groups:', error);
          }
        };
        fetchGroups();
      }
    }, [type])
  );

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const userMap: {[key: string]: string} = {};

        // 1. Fetch Group Members
        try {
            const groupsRes: any = await getMyGroups();
            const groups = Array.isArray(groupsRes) ? groupsRes : (groupsRes?.data || groupsRes?.groups || []);
            if (Array.isArray(groups) && groups.length > 0) {
                const memberPromises = groups.map((g: any) => getGroupMembers(g.id).catch(() => null));
                const results = await Promise.all(memberPromises);
                results.forEach((res: any) => {
                    const members = Array.isArray(res) ? res : (res?.data || []);
                    if (Array.isArray(members)) {
                        members.forEach((m: any) => {
                            if (m.id && m.name) userMap[String(m.id)] = m.name;
                        });
                    }
                });
            }
        } catch (e) {}

        // 2. Fetch Debts
        try {
            const debtsRes: any = await getAllDebts();
            const debts = Array.isArray(debtsRes) ? debtsRes : debtsRes?.data || [];
            if (Array.isArray(debts)) {
                debts.forEach((d: any) => {
                   if (d.borrower_id && d.borrower_name) userMap[String(d.borrower_id)] = d.borrower_name;
                   if (d.lender_id && d.lender_name) userMap[String(d.lender_id)] = d.lender_name;
                });
            }
        } catch (e) {}

        // 3. Fetch Contacts
        const response: any = await getAllContacts();
        const rawContacts = Array.isArray(response) ? response : (response.data || response.contacts || []);
        
        const enrichedContacts = rawContacts.map((c: any) => {
             const targetId = c.user_id_contact || c.id;
             const name = c.name || userMap[String(targetId)] || String(targetId);
             
             return {
                 ...c,
                 name: name,
                 id: targetId 
             };
        });

        setContacts(enrichedContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    fetchContacts();
  }, []);

  // Handle group transaction initialization
  useEffect(() => {
    const initializeGroupTransaction = async () => {
      if (params.type === 'group' && params.userId) {
        try {
          // Fetch groups to find the selected group
          const response: any = await getMyGroups();
          const groupsList = Array.isArray(response) ? response : (response.data || response.groups || []);
          setGroups(groupsList);

          // Find and select the group
          const group = groupsList.find((g: any) => String(g.id) === String(params.userId));
          if (group) {
            setSelectedGroup(group);
            // For group transactions, userName should be the payer's name
            // Leave it empty or set to current user as default payer
            const storedUser = await storage.getUser();
            if (storedUser && storedUser.name) {
              setUserNameStr(storedUser.name); // Default to current user as payer
            }
          }
        } catch (error) {
          console.error('Error initializing group transaction:', error);
        }
      }
    };

    initializeGroupTransaction();
  }, [params.type, params.userId]);

  useEffect(() => {
    if (phone && typeof phone === 'string' && phone.trim()) {
      const filtered = contacts.filter(contact =>
        contact.phone && contact.phone.trim() && contact.phone.includes(phone.trim())
      );
      setFilteredContacts(filtered);
      setShowSuggestions(filtered.length > 0 && !borrowerId);
      setShowNameInput(filtered.length === 0 && phone.trim() !== "");
    } else {
      setFilteredContacts([]);
      setShowSuggestions(false);
      setShowNameInput(false);
      setIsSaveContactDisabled(false);
    }
  }, [phone, contacts, borrowerId]); 

  useEffect(() => {
    if (showNameInput && userName && typeof userName === 'string' && userName.trim()) {
      const exactMatch = contacts.find(c => c.name.toLowerCase() === userName.trim().toLowerCase());
      if (exactMatch) {
        setIsSaveContact(true);
        setIsSaveContactDisabled(true);
      } else {
        setIsSaveContactDisabled(false);
      }
    } else {
      setIsSaveContactDisabled(false);
    }
  }, [userName, showNameInput, contacts]); 

  const typeData = [
    { label: 'Mượn nợ', value: 'muon' }, // Người kia nợ mình
    { label: 'Cho mượn', value: 'cho_muon' }, // Mình nợ người kia (hoặc người kia cho mình mượn)
    { label: 'Khoản chi nhóm', value: 'chi'} // Người kia trả tiền cho nhóm
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

  const mapReminderToDays = (reminderValue: string): number => {
    switch (reminderValue) {
      case '1_day': return 1;
      case '3_days': return 3;
      case '1_week': return 7;
      case '1_month': return 30;
      default: return 1;
    }
  };

  const onSubmit = async () => {
    if (!userName || typeof userName !== 'string' || !userName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên");
      return;
    }

    if (!amount.trim() || isNaN(Number(amount.replace(/[^\d]/g, '')))) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUser = await storage.getUser();
      if (!storedUser || !storedUser.id) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        setIsSubmitting(false);
        return;
      }
      const currentUserId = storedUser.id;
      const currentUserName = storedUser.name || "";

      // --- LOGIC TÌM ID CỦA NGƯỜI ĐƯỢC ĐIỀN TÊN (TARGET) ---
      let targetUserId: number | null = borrowerId ? Number(borrowerId) : null;

      // 1. Thử tìm trong danh bạ khớp tên
      if (!targetUserId && userName && typeof userName === 'string' && userName.trim()) {
         const exactMatch = contacts.find(c => c.name.toLowerCase() === userName.trim().toLowerCase());
         if (exactMatch) targetUserId = exactMatch.id;
      }

      // 2. Thử tìm bằng số điện thoại trong danh bạ
      if (!targetUserId && phone.trim()) {
           const phoneMatch = contacts.find(c => c.phone === phone.trim());
           if (phoneMatch) targetUserId = phoneMatch.id;
      }

      // 3. GỌI API TÌM TRÊN SERVER
      if (!targetUserId && phone.trim()) {
          try {
              const searchRes: any = await findUserByPhone(phone.trim());
              const foundUsers = Array.isArray(searchRes) ? searchRes : (searchRes?.data || []);
              
              if (foundUsers.length > 0) {
                  const serverUser = foundUsers[0]; 
                  targetUserId = serverUser.id;
                  
                  // Cập nhật tên hiển thị
                  const realName = serverUser.name || serverUser.full_name || userName;
                  setUserNameStr(realName);
                  
                  console.log(`Tìm thấy: ${realName} (ID: ${targetUserId})`);
              }
          } catch (e) {
              console.log("API search failed:", e);
          }
      }

      // 4. Check chính mình (Nếu tên nhập vào là chính mình)
      if (!targetUserId && userName.toLowerCase() === currentUserName.toLowerCase()) {
         targetUserId = currentUserId;
      }

      // --- CHECK LẦN CUỐI ---
      if (!targetUserId) {
          Alert.alert(
              "Không tìm thấy tài khoản",
              `Số điện thoại ${phone} chưa đăng ký hoặc không tồn tại.`,
              [ { text: "Đã hiểu" } ]
          );
          setIsSubmitting(false);
          return;
      }

      const amountNumber = Number(amount.replace(/[^\d]/g, ''));
      const remindBeforeDays = mapReminderToDays(reminder);
      const dueDate = date.toISOString().split('T')[0];

      // ============================================
      // LOGIC XỬ LÝ THEO LOẠI GIAO DỊCH
      // ============================================

      // A. CHI TIÊU NHÓM: Target User là người Trả tiền (Payer)
      // A. CHI TIÊU NHÓM: Target User là người Trả tiền (Payer)
      if (type === 'chi') {
        if (!selectedGroup) {
          Alert.alert("Lỗi", "Vui lòng chọn nhóm để tạo khoản chi.");
          setIsSubmitting(false);
          return;
        }

        // --- BỔ SUNG LOGIC LẤY THÀNH VIÊN ---
        let involvedMemberIds: number[] = [];
        try {
            // Gọi API lấy danh sách thành viên mới nhất của nhóm đó
            const membersRes: any = await getGroupMembers(selectedGroup.id);
            const membersList = Array.isArray(membersRes) ? membersRes : (membersRes?.data || []);
            
            // Lấy ra mảng các ID thành viên
            involvedMemberIds = membersList.map((m: any) => m.id);

            // Kiểm tra an toàn: Đảm bảo người trả tiền (Payer) cũng có trong danh sách chia tiền
            if (targetUserId && !involvedMemberIds.includes(targetUserId)) {
                involvedMemberIds.push(targetUserId);
            }
        } catch (e) {
            console.error("Lỗi lấy thành viên nhóm:", e);
            Alert.alert("Lỗi", "Không thể lấy danh sách thành viên nhóm.");
            setIsSubmitting(false);
            return;
        }
        // -------------------------------------

        const expenseData = {
          totalAmount: amountNumber,
          due_date: dueDate,
          remind_before: remindBeforeDays,
          description: note.trim() || null,
          payer_id: targetUserId, 
          
          // GỬI THÊM TRƯỜNG NÀY XUỐNG BACKEND
          // Backend sẽ dùng mảng này để tính: amount_per_person = totalAmount / involved_members.length
          involved_members: involvedMemberIds, 
        };

        const response = await createGroupExpense(selectedGroup.id, expenseData);
        if (response && (response.expense_id || response.status === 200)) {
           handleSuccess(response.expense_id);
        } else {
           throw new Error("Lỗi server (Group)");
        }
        return;
      }

      // B. GIAO DỊCH CÁ NHÂN (MƯỢN / CHO MƯỢN)
      // Backend sẽ tự động set lender/borrower dựa trên type
      
      if (targetUserId === currentUserId) {
        Alert.alert("Lỗi", "Không thể tạo giao dịch với chính mình");
        setIsSubmitting(false);
        return;
      }

      const debtData: any = {
        borrower_id: targetUserId, // Luôn là targetUserId, backend sẽ xử lý vai trò dựa trên type
        type: type, 
        amount: amountNumber,
        due_date: dueDate,
        remind_before: remindBeforeDays,
        note: note.trim() || null,
        isSaved: isSaved,
      };

      let transactionTitle = userName;
      if (note.trim()) transactionTitle += ` - ${note.trim()}`;
      debtData.title = transactionTitle;

      const response = await createDebt(debtData);
      if (response && response.debt_id) {
        // Lưu contact nếu được yêu cầu (chỉ lưu nếu Target là người mới)
        if (isSaveContact && phone && phone.trim() && targetUserId !== currentUserId && !selectedFromContacts) {
          try {
            await createContactByPhone({ phone: phone.trim(), name: userName.trim() });
          } catch (e) {
            console.log("Failed to save contact:", e);
          }
        }
        handleSuccess(response.debt_id);
      } else {
        throw new Error("Lỗi server (Debt)");
      }

    } catch (err: any) {
      console.error('Submit error:', err);
      const errorMessage = err?.message || err?.error || "Lỗi tạo giao dịch.";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSuccess = (id: any) => {
    Alert.alert("Thành công", "Tạo giao dịch thành công!", [
        {
          text: "OK",
          onPress: () => {
            dispatch(clearPageProgress(PAGE_ID));
            dispatch(setCurrentRoute({ pageId: null }));
            // Dùng setTimeout để tránh lỗi điều hướng
            setTimeout(() => {
                if (id) {
                     router.push({
                        pathname: '/transaction-detail',
                        params: { id: id }
                      });
                } else {
                    router.push('/(tabs)/home');
                }
            }, 100);
          }
        }
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            router.push('/(tabs)/transaction?tab=recent');
          }}>
            <Ionicons name="chevron-back-outline" size={30} color="#FFFFFF"/>
          </TouchableOpacity>
          <Text style={styles.header}>Tạo mới giao dịch</Text>
          <View style={styles.infoButton} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.inputGroup, { zIndex: 10 }]}> 
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (borrowerId) {
                  setBorrowerId(null);
                  setIsSaveContactDisabled(false);
                  setIsSaveContact(false);
                  setSelectedFromContacts(false);
                }
              }}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#AAAAAA"
              keyboardType="phone-pad"
            />
            {showSuggestions && filteredContacts.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {filteredContacts.map((item) => (
                    <TouchableOpacity
                      key={item.id ? item.id.toString() : Math.random().toString()}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setUserNameStr(item.name);
                        setBorrowerId(item.id);
                        setShowSuggestions(false);
                        setShowNameInput(false);
                        setIsSaveContact(true);
                        setIsSaveContactDisabled(true);
                        setSelectedFromContacts(true);
                      }}
                    >
                      <Text style={styles.suggestionText}>{item.name}</Text>
                      <Text style={{color: '#888', fontSize: 12}}>{item.phone}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
            {showNameInput && (
              <View style={{marginTop: 20}}>
                <TextInput
                  style={styles.input}
                  value={userName}
                  onChangeText={(text) => {
                    const capitalized = capitalizeAfterSpaces(text);
                    setUserNameStr(capitalized);
                  }}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#AAAAAA"
                />
                <View style={[styles.checkboxContainer, { marginTop: 10 }]}>
                  <Checkbox style={styles.checkbox} value={isSaveContact} onValueChange={setIsSaveContact} color={isSaveContact ? '#3875F6' : undefined} disabled={isSaveContactDisabled} />
                  <Text style={styles.checkboxLabel}>Lưu vào danh sách</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại</Text>
            {userType !== 'group' && (
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              itemTextStyle={styles.itemText}
              selectedTextStyle={styles.selectedText}
              activeColor={'#1e1e1e'}
              data={userType == 'user'? typeData.slice(0, 2) : typeData}
              labelField="label"
              valueField="value"
              value={type}
              onChange={item => setType(item.value)}
              renderRightIcon={() => <Ionicons name="chevron-down" size={20} color="#AAA" />}
            />)}
            {userType === 'group' && (
              <View style={[styles.input, styles.disabledInput]}>
                <Text style={styles.selectedText}>Chi tiêu nhóm</Text>
              </View>
            )}
          </View>

          {type === 'chi' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chọn nhóm</Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                itemTextStyle={styles.itemText}
                selectedTextStyle={styles.selectedText}
                activeColor={'#1e1e1e'}
                data={[
                  { label: 'Tạo nhóm mới', value: 'create_new' },
                  ...groups.map(group => ({ label: group.name, value: group.id }))
                ]}
                labelField="label"
                valueField="value"
                value={selectedGroup?.id}
                onChange={item => {
                  if (item.value === 'create_new') {
                    router.push({
                      pathname: '/screen/create-group',
                      params: { userId: auth.user?.id ?? '' }
                    });
                  } else {
                    const group = groups.find(g => g.id === item.value);
                    setSelectedGroup(group);
                  }
                }}
                placeholder="Chọn nhóm"
                placeholderStyle={{ color: '#AAAAAA' }}
                renderRightIcon={() => <Ionicons name="chevron-down" size={20} color="#FFFFFF" />}
              />
            </View>
          )}

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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số tiền</Text>
            <View style={styles.amountInputContainer}>
              <TextInput 
                style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                value={amount} 
                onChangeText={setAmount} 
                keyboardType="numeric" 
                placeholder="0"
                placeholderTextColor="#AAAAAA"
              />
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

          <View style={[styles.checkboxContainer, { marginTop: 10 }]}>
            <Checkbox style={styles.checkbox} value={isRepeat} onValueChange={setRepeat} color={isRepeat ? '#3875F6' : undefined} />
            <Text style={styles.checkboxLabel}>Lặp lại</Text>
          </View>

          <View style={[styles.inputGroup, { marginTop: 20 }]}>
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={note} onChangeText={setNote} placeholder="..." placeholderTextColor="#AAAAAA" />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Tạo mới</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

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
    padding: 20,
    paddingBottom: 50
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
    backgroundColor: '#3A3A3A'
  },
  dropdown: {
    height: 50,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3A3A3A'
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
  suggestionsContainer: {
    position: 'absolute',
    top: 85, // Adjust based on input height + label
    left: 0,
    right: 0,
    backgroundColor: '#3A3A3A',
    borderRadius: 5,
    maxHeight: 150,
    zIndex: 9999, // High zIndex to float over other inputs
    borderWidth: 1,
    borderColor: '#555'
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  suggestionText: {
    color: '#FFF',
    fontSize: 16,
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
  submitBtnDisabled: {
    opacity: 0.6,
  },
  disabledInput: {
    backgroundColor: '#333',
    opacity: 0.6,
  },
});

export default AddTransactionScreen;