import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { scale } from '@/utils/stylings';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { register } from '@/service/authService';
import { storage } from '@/utils/storage';
import { useDispatch } from 'react-redux';
import { logIn } from '@/store/auth';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { updatePushToken } from '@/service/userService';

const RegisterScreen = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // [MỚI]: State cho số điện thoại
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper function to capitalize after spaces (for Vietnamese names)
  const capitalizeAfterSpaces = (text: string) => {
    return text.replace(/(\s|^)\w/g, (match) => match.toUpperCase());
  };

  // Refs điều khiển focus
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null); // [MỚI]: Ref cho ô Phone
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    Keyboard.dismiss();
    
    // [MỚI]: Thêm check phone
    if (!name || !email || !phone || !password || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    // Validate phone format
    if (phone.length !== 10 || !phone.startsWith('0')) {
      alert('Số điện thoại phải bắt đầu bằng 0 và có đúng 10 số.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp.');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        full_name: name,
        email: email,
        phone: phone, // [MỚI]: Gửi số điện thoại thực tế
        password: password,
      };
      
      const response = await register(userData);
      
      if (response && (response.status === 200 || response.status === 201 || response.message)) {
        setLoading(false);
        alert('Đăng ký thành công!');
        router.replace('/auth/login' as any);
      } else {
        setLoading(false);
        // Check if it's a duplicate phone error
        const errorMessage = response?.message || response?.error || 'Đăng ký thất bại';
        if (errorMessage.toLowerCase().includes('phone') && 
            (errorMessage.toLowerCase().includes('exist') || 
             errorMessage.toLowerCase().includes('duplicate') ||
             errorMessage.toLowerCase().includes('đã'))) {
          alert('Số điện thoại này đã được đăng ký. Vui lòng sử dụng số điện thoại khác.');
        } else {
          alert(errorMessage);
        }
      }
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error?.message || error?.error || 'Đăng ký thất bại';
      alert(errorMessage);
      console.error('Register error:', error);
    }
  };

  const goToLogin = () => {
    router.replace('/auth/login' as any);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.Neutral300} />

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            
            <View style={styles.header}>
              <Text style={styles.logo}>SMART DEBT</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.title}>Tạo tài khoản mới:</Text>

              {/* Name input */}
              <View style={styles.inputContainer}>
                <Text style={styles.icon}></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên"
                  placeholderTextColor={colors.Neutral100}
                  value={name}
                  onChangeText={(text) => setName(capitalizeAfterSpaces(text))}
                  editable={!loading}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.icon}></Text>
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="Nhập email"
                  placeholderTextColor={colors.Neutral100}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  returnKeyType="next"
                  // [MỚI]: Sửa logic focus, từ Email nhảy sang Phone
                  onSubmitEditing={() => phoneRef.current?.focus()} 
                  blurOnSubmit={false}
                />
              </View>

              {/* [MỚI]: Phone Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.icon}></Text>
                <TextInput
                  ref={phoneRef} // Gắn Ref
                  style={styles.input}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={colors.Neutral100}
                  value={phone}
                  onChangeText={(text) => {
                    // Only allow digits, start with 0, max 10 characters
                    let formatted = text.replace(/\D/g, ''); // Remove non-digits
                    if (formatted.length > 0 && !formatted.startsWith('0')) {
                      formatted = '0' + formatted.replace(/^0+/, ''); // Ensure starts with 0
                    }
                    if (formatted.length > 10) {
                      formatted = formatted.slice(0, 10); // Limit to 10 digits
                    }
                    setPhone(formatted);
                  }}
                  keyboardType="phone-pad" // Bàn phím số cho điện thoại
                  editable={!loading}
                  returnKeyType="next"
                  // Từ Phone nhảy sang Password
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.icon}></Text>
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={colors.Neutral100}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.icon}></Text>
                <TextInput
                  ref={confirmPasswordRef}
                  style={styles.input}
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor={colors.Neutral100}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
              </View>

              {/* Register button */}
              <TouchableOpacity
                onPress={handleRegister}
                activeOpacity={0.8}
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Đăng ký</Text>
                )}
              </TouchableOpacity>

              {/* Back to login */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Đã có tài khoản ? </Text>
                <TouchableOpacity onPress={goToLogin} disabled={loading}>
                  <Text style={styles.registerLink}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: spacingY._40 }} /> 

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

// Styles giữ nguyên không thay đổi
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Neutral300,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._40,
  },
  header: {
    alignItems: 'center',
    marginTop: spacingY._40,
    marginBottom: spacingY._40,
  },
  logo: {
    fontSize: scale(40),
    fontFamily: 'RowdiesBold',
    fontWeight: '900',
    color: colors.primary300,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  formSection: {
    gap: spacingY._20,
  },
  title: {
    fontSize: scale(15),
    color: '#FFFFFF',
    fontFamily: 'RobotoBold',
    fontWeight: '700',
    marginBottom: spacingY._10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.Neutral100,
    borderRadius: radius._30,
    paddingHorizontal: spacingX._20,
    height: spacingY._60,
  },
  icon: {
    marginRight: spacingX._12,
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
  loginButton: {
    backgroundColor: colors.primary300,
    height: spacingY._60,
    borderRadius: radius._30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary300,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    marginTop: spacingY._10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontFamily: 'RobotoBold',
    fontSize: scale(17),
    fontWeight: '700',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacingY._10,
    paddingBottom: spacingY._20,
  },
  registerText: {
    fontSize: scale(14),
    fontFamily: 'RobotoRegular',
    fontWeight: '400',
    color: colors.Neutral100,
  },
  registerLink: {
    fontSize: scale(14),
    color: colors.primary300,
    fontFamily: 'RobotoRegular',
    fontWeight: '600',
  },
});

export default RegisterScreen;