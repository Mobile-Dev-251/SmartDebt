import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  PencilSimple,
  CaretDown,
} from "phosphor-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";
import { getMyProfile, updateProfile } from "@/service/userService";
import { storage } from "@/utils/storage";

const ProfileInfoScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [showGender, setShowGender] = useState(false);
  const [birth, setBirth] = useState("01/01/2004");
  const [showBirth, setShowBirth] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Helper function to capitalize after spaces (for Vietnamese names)
  const capitalizeAfterSpaces = (text: string) => {
    return text.replace(/(\s|^)\w/g, (match) => match.toUpperCase());
  };

  const formatDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const parseDate = (value: string) => {
    const [dd, mm, yyyy] = value.split("/").map((p) => parseInt(p, 10));
    return new Date(yyyy, mm - 1, dd);
  };

  // Check if URI is a local file URI (not a server URL)
  const isLocalUri = (uri: string | null): boolean => {
    if (!uri) return false;
    return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://');
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      // Try to get from storage first
      const storedUser = await storage.getUser();
      if (storedUser) {
        setFullName(storedUser.full_name || storedUser.name || "");
        setPhone(storedUser.phone || "");
        setEmail(storedUser.email || "");
        // Load gender and birth from storage (frontend-only fields)
        if (storedUser.gender) {
          setGender(storedUser.gender as "Nam" | "Nữ" | "Khác");
        }
        if (storedUser.birth || storedUser.date_of_birth) {
          setBirth(storedUser.birth || storedUser.date_of_birth || "01/01/2004");
        }
        if (storedUser.avatar_url) {
          setAvatarUri(storedUser.avatar_url);
          setOriginalAvatarUrl(storedUser.avatar_url);
        }
      }

      // Try to fetch from API (but don't block UI if it fails)
      try {
        const response = await getMyProfile();
        let profile = null;
        
        // Handle different response formats
        if (response && response.profile && response.profile.length > 0) {
          profile = response.profile[0];
        } else if (response && response.user) {
          profile = response.user;
        } else if (response && response.name) {
          profile = response;
        }
        
        if (profile) {
          setFullName(profile.name || "");
          setPhone(profile.phone || "");
          setEmail(profile.email || "");
          
          // Load gender and birth from API if available (though backend may not support)
          if (profile.gender) {
            setGender(profile.gender as "Nam" | "Nữ" | "Khác");
          }
          if (profile.birth || profile.date_of_birth) {
            const birthDate = profile.birth || profile.date_of_birth;
            if (birthDate) {
              // Handle different date formats
              if (typeof birthDate === 'string') {
                if (birthDate.includes('/')) {
                  setBirth(birthDate);
                } else {
                  // Try to parse ISO date or other formats
                  const date = new Date(birthDate);
                  if (!isNaN(date.getTime())) {
                    setBirth(formatDate(date));
                  }
                }
              }
            }
          }
          
          if (profile.avatar_url) {
            setAvatarUri(profile.avatar_url);
            setOriginalAvatarUrl(profile.avatar_url);
          }
          
          // Update storage with all data
          await storage.setUser({
            ...storedUser,
            full_name: profile.name,
            name: profile.name,
            phone: profile.phone,
            email: profile.email,
            avatar_url: profile.avatar_url,
            gender: profile.gender || storedUser?.gender || gender,
            birth: profile.birth || profile.date_of_birth || storedUser?.birth || birth,
          });
        }
      } catch (apiError: any) {
        // API call failed, but we already have data from storage
        console.warn("Không thể cập nhật profile từ API:", apiError?.message || apiError);
        // Only show error if we don't have cached data
        if (!storedUser) {
          Alert.alert(
            "Cảnh báo", 
            `Không thể kết nối đến server. Đang sử dụng dữ liệu đã lưu.\n\n${apiError?.message || "Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy."}`
          );
        }
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      // Fallback to stored user or show error
      try {
        const storedUser = await storage.getUser();
        if (!storedUser) {
          Alert.alert("Lỗi", "Không thể tải thông tin cá nhân");
        }
      } catch (storageError) {
        Alert.alert("Lỗi", "Không thể truy cập dữ liệu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên");
      return;
    }

    // Validate phone if entered
    if (phone.trim() && (phone.length !== 10 || !phone.startsWith('0'))) {
      Alert.alert("Lỗi", "Số điện thoại phải bắt đầu bằng 0 và có đúng 10 số");
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {
        name: fullName.trim(),
      };

      if (phone.trim()) {
        updateData.phone = phone.trim();
      }

      // Only send avatar_url if it's a server URL, not a local URI
      // If user selected a new image (local URI), we keep the original URL
      // Backend doesn't support file upload, so we only update if it's already a URL
      if (avatarUri && !isLocalUri(avatarUri)) {
        updateData.avatar_url = avatarUri;
      } else if (originalAvatarUrl && !avatarUri) {
        // If user removed avatar, keep original
        updateData.avatar_url = originalAvatarUrl;
      } else if (originalAvatarUrl && isLocalUri(avatarUri)) {
        // If user selected new local image, keep original URL (backend doesn't support upload)
        updateData.avatar_url = originalAvatarUrl;
      }

      const response = await updateProfile(updateData);
      
      // Handle different response formats
      const isSuccess = response && (
        response.status === 200 || 
        (typeof response === 'string' && response.includes('Successfully')) ||
        response.message
      );
      
      if (isSuccess) {
        // Get current stored user
        const storedUser = await storage.getUser();
        
        // Prepare updated user data
        const updatedUser = {
          ...storedUser,
          full_name: fullName.trim(),
          name: fullName.trim(),
          phone: phone.trim() || storedUser?.phone || null,
          email: email || storedUser?.email || null,
          // Keep avatar_url as original if local URI was selected, otherwise use the one from response or current
          avatar_url: (avatarUri && !isLocalUri(avatarUri)) 
            ? avatarUri 
            : (originalAvatarUrl || storedUser?.avatar_url || null),
          // Save frontend-only fields (gender, birth) to storage
          gender: gender,
          birth: birth,
        };
        
        // Update storage with all data
        await storage.setUser(updatedUser);
        
        // Update Redux store if needed (optional, depends on your setup)
        
        Alert.alert("Thành công", typeof response === 'string' ? response : (response.message || "Cập nhật thông tin thành công"));
        router.back();
      } else {
        Alert.alert("Lỗi", response?.message || response?.error || "Không thể cập nhật thông tin");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error?.message || error?.error || error?.data?.message || "Không thể cập nhật thông tin";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const requestImagePickerPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Ứng dụng cần quyền truy cập thư viện ảnh để cập nhật avatar"
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePickerPermission();
    if (!hasPermission) return;

    Alert.alert(
      "Chọn ảnh",
      "Bạn muốn chọn ảnh từ đâu?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Thư viện",
          onPress: async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                // Store local URI for display, but keep original URL for backend
                setAvatarUri(result.assets[0].uri);
                // Note: Backend doesn't support file upload, so we'll keep original URL when updating
              }
            } catch (error) {
              Alert.alert("Lỗi", "Không thể chọn ảnh từ thư viện");
            }
          },
        },
        {
          text: "Camera",
          onPress: async () => {
            try {
              const { status } =
                await ImagePicker.requestCameraPermissionsAsync();
              if (status !== "granted") {
                Alert.alert(
                  "Cần quyền truy cập",
                  "Ứng dụng cần quyền truy cập camera để chụp ảnh"
                );
                return;
              }

              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                // Store local URI for display, but keep original URL for backend
                setAvatarUri(result.assets[0].uri);
                // Note: Backend doesn't support file upload, so we'll keep original URL when updating
              }
            } catch (error) {
              Alert.alert("Lỗi", "Không thể chụp ảnh");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={scale(22)} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
          <Text style={styles.title}>Thông tin cá nhân</Text>
          <View style={{ width: scale(22) }} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary300} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={scale(22)} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <View style={{ width: scale(22) }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : require("@/assets/images/avatar.png")
              }
              style={styles.avatar}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <PencilSimple size={scale(16)} color="#FFFFFF" weight="bold" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{fullName}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={(text) => setFullName(capitalizeAfterSpaces(text))}
            placeholder="Nhập họ tên"
            placeholderTextColor={colors.Neutral100}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.Neutral400, color: colors.Neutral100 }]}
            value={email}
            editable={false}
            placeholder="Email (không thể thay đổi)"
            placeholderTextColor={colors.Neutral100}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
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
            placeholder="Nhập số điện thoại"
            placeholderTextColor={colors.Neutral100}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Giới tính</Text>
          <TouchableOpacity
            style={styles.inputRow}
            activeOpacity={0.85}
            onPress={() => setShowGender((v) => !v)}
          >
            <Text style={styles.inputValue}>{gender}</Text>
            <CaretDown size={scale(14)} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
          {showGender && (
            <View style={styles.dropdown}>
              {(["Nam", "Nữ", "Khác"] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setGender(g);
                    setShowGender(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Sinh nhật</Text>
          <TouchableOpacity
            style={styles.inputRow}
            activeOpacity={0.85}
            onPress={() => setShowBirth(true)}
          >
            <Text style={styles.inputValue}>{birth}</Text>
            <CaretDown size={scale(14)} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
          {showBirth && (
            <View style={styles.datePickerWrapper}>
              <DateTimePicker
                value={parseDate(birth)}
                mode="date"
                display="spinner"
                themeVariant="light"
                onChange={(_e: any, selected?: Date) => {
                  if (selected) {
                    setBirth(formatDate(selected));
                  }
                  setShowBirth(false);
                }}
              />
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.editBtn, isUpdating && styles.editBtnDisabled]} 
          activeOpacity={0.9}
          onPress={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <PencilSimple size={scale(16)} color="#FFFFFF" weight="bold" />
              <Text style={styles.editText}>Cập nhật</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Neutral200,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(18),
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
    gap: spacingY._15,
  },
  avatarWrap: {
    alignItems: "center",
    gap: spacingY._10,
    marginTop: spacingY._10,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: scale(90),
    height: scale(90),
    borderRadius: radius._30,
    backgroundColor: colors.Neutral300,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: colors.primary300,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.Neutral200,
  },
  name: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
  },
  field: {
    gap: spacingY._5,
  },
  label: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(13),
  },
  input: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: colors.Neutral400,
    height: spacingY._50,
    paddingHorizontal: spacingX._15,
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
  },
  inputRow: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: colors.Neutral400,
    height: spacingY._50,
    paddingHorizontal: spacingX._15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputValue: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
  },
  dropdown: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: colors.Neutral400,
    marginTop: spacingY._5,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._10,
  },
  dropdownText: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
  },
  datePickerWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius._12,
    marginTop: spacingY._5,
    overflow: "hidden",
  },
  editBtn: {
    height: spacingY._50,
    borderRadius: radius._12,
    backgroundColor: colors.primary300,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._7,
    marginTop: spacingY._10,
  },
  editText: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(14),
  },
  editBtnDisabled: {
    opacity: 0.6,
  },
});

export default ProfileInfoScreen;






