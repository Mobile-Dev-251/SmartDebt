// app/auth/login.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { scale, verticalScale } from "@/utils/stylings";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { login } from "@/service/authService";
import { storage } from "@/utils/storage";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        email: email,
        password: password,
      };
      const response = await login(userData);
      
      // Check if response has token
      if (response && response.token) {
        // Save token to storage
        await storage.setToken(response.token);
        
        // Save user data if available
        if (response.user) {
          await storage.setUser(response.user);
        }
        
        setLoading(false);
        router.replace("/(tabs)" as any);
      } else if (response && response.status !== 200) {
        alert(response.message || "Đăng nhập thất bại");
        setLoading(false);
      } else {
        alert("Đăng nhập thất bại. Vui lòng thử lại.");
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error?.message || error?.error || "Đăng nhập thất bại";
      alert(errorMessage);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Điều hướng đến màn hình quên mật khẩu
    console.log("Quên mật khẩu");
  };

  const handleRegister = () => {
    router.push("/auth/register" as any);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.Neutral300} />

      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>SMART DEBT</Text>
          </View>

          {/* Form section */}
          <View style={styles.formSection}>
            {/* Title */}
            <Text style={styles.title}>
              Đăng nhập để quản lý các khoản chi tiêu:
            </Text>

            {/* Email input */}
            <View style={styles.inputContainer}>
              <View style={styles.iconWrapper}>
                <Text style={styles.icon}></Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nhập email"
                placeholderTextColor={colors.Neutral100}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password input */}
            <View style={styles.inputContainer}>
              <View style={styles.iconWrapper}>
                <Text style={styles.icon}></Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={colors.Neutral100}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordContainer}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu ?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.8}
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            {/* Register link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Bạn chưa có tài khoản ? </Text>
              <TouchableOpacity onPress={handleRegister} disabled={loading}>
                <Text style={styles.registerLink}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom spacer */}
          <View style={styles.spacer} />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Neutral300,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  header: {
    alignItems: "center",
    paddingTop: spacingY._40,
    marginBottom: spacingY._60,
  },
  logo: {
    fontSize: scale(40),
    fontFamily: "RowdiesBold",
    fontWeight: "900",
    color: colors.primary300,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  formSection: {
    gap: spacingY._20,
  },
  title: {
    fontSize: scale(15),
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontWeight: "700",
    marginBottom: spacingY._10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.Neutral100,
    borderRadius: radius._30,
    paddingHorizontal: spacingX._20,
    height: spacingY._60,
  },
  iconWrapper: {
    marginRight: spacingX._12,
  },
  icon: {
    fontSize: scale(20),
    color: colors.Neutral100,
  },
  input: {
    flex: 1,
    fontSize: scale(15),
    fontFamily: "RobotoRegular",
    fontWeight: "400",
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: -spacingY._10,
  },
  forgotPasswordText: {
    fontSize: scale(14),
    fontFamily: "RobotoRegular",
    fontWeight: "400",
    color: colors.Neutral100,
  },
  loginButton: {
    backgroundColor: colors.primary300,
    height: spacingY._60,
    borderRadius: radius._30,
    justifyContent: "center",
    alignItems: "center",
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
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(17),
    fontWeight: "700",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacingY._10,
  },
  registerText: {
    fontSize: scale(14),
    fontFamily: "RobotoRegular",
    fontWeight: "400",
    color: colors.Neutral100,
  },
  registerLink: {
    fontSize: scale(14),
    fontFamily: "RobotoRegular",
    color: colors.primary300,
    fontWeight: "600",
  },
  spacer: {
    flex: 1,
  },
});

export default LoginScreen;
