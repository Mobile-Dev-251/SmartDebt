import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";
import {
  CaretRight,
  User,
  BellSimple,
  HeartStraight,
  SignOut,
} from "phosphor-react-native";
import { getMyProfile } from "@/service/userService";
import { storage } from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "@/store/auth";
import { clearSession } from "@/store/progress";
import { RootState } from "@/store/store";

type MenuItem = {
  id: string;
  label: string;
  sub?: string;
  icon: React.ReactNode;
  onPress: () => void;
};

const ProfileScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    let storedUser = null;
    
    try {
      // Try to get from storage first
      storedUser = await storage.getUser();
      if (storedUser) {
        setUserName(storedUser.full_name || storedUser.name || "");
        // Only set avatar if it's a server URL, not a local URI
        if (storedUser.avatar_url && !storedUser.avatar_url.startsWith('file://') && !storedUser.avatar_url.startsWith('content://')) {
          setAvatarUrl(storedUser.avatar_url);
        }
        // Set loading to false early if we have cached data
        setIsLoading(false);
      }

      // Try to fetch from API (but don't block UI if it fails)
      try {
        const response = await getMyProfile();
        console.log('Profile response:', response);
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
          setUserName(profile.name || profile.full_name || "");
          
          // Only set avatar if it's a server URL
          if (profile.avatar_url && !profile.avatar_url.startsWith('file://') && !profile.avatar_url.startsWith('content://')) {
            setAvatarUrl(profile.avatar_url);
          }
          
          // Update storage with all data (including frontend-only fields)
          await storage.setUser({
            ...storedUser,
            full_name: profile.name || profile.full_name,
            name: profile.name || profile.full_name,
            phone: profile.phone || storedUser?.phone,
            email: profile.email || storedUser?.email,
            avatar_url: profile.avatar_url || storedUser?.avatar_url,
            // Preserve frontend-only fields
            gender: storedUser?.gender,
            birth: storedUser?.birth || storedUser?.date_of_birth,
          });
        }
      } catch (apiError: any) {
        // API call failed, but we already have data from storage
        console.warn("Không thể cập nhật profile từ API:", apiError?.message || apiError);
        // Don't show error to user if we have cached data
        if (!storedUser) {
          // Only set default if no cached data
          setUserName("SmartDebt User");
        }
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      // Fallback to stored user or default
      try {
        const fallbackUser = await storage.getUser();
        if (fallbackUser) {
          setUserName(fallbackUser.full_name || fallbackUser.name || "SmartDebt User");
          if (fallbackUser.avatar_url && !fallbackUser.avatar_url.startsWith('file://') && !fallbackUser.avatar_url.startsWith('content://')) {
            setAvatarUrl(fallbackUser.avatar_url);
          }
        } else {
          setUserName("SmartDebt User");
        }
      } catch (storageError) {
        console.error("Error accessing storage:", storageError);
        setUserName("SmartDebt User");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (authUser) {
        loadProfile();
      }
    }, [authUser, loadProfile])
  );

  const menu: MenuItem[] = [
    {
      id: "info",
      label: "Thông tin cá nhân",
      sub: "Cập nhật hồ sơ cá nhân",
      icon: (
        <User size={scale(18)} color={colors.primary300} weight="bold" />
      ),
      onPress: () => router.push("/profile-info"),
    },
    {
      id: "help",
      label: "Trung tâm trợ giúp",
      icon: (
        <BellSimple size={scale(18)} color={colors.primary300} weight="bold" />
      ),
      onPress: () => router.push("/help-center"),
    },
    {
      id: "app",
      label: "Thông tin ứng dụng",
      icon: (
        <HeartStraight
          size={scale(18)}
          color={colors.primary300}
          weight="bold"
        />
      ),
      onPress: () => router.push("/app-info"),
    },
    {
      id: "logout",
      label: "Đăng xuất",
      onPress: async () => 
      {
        dispatch(logOut());
        dispatch(clearSession());
        await storage.removeToken();
        await storage.removeUser();
        router.push('/auth/AuthScreen');
      },
      icon: (
        <SignOut size={scale(18)} color={colors.primary300} weight="bold" />
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary300} />
        ) : (
          <>
            <Image
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : require("@/assets/images/avatar.png")
              }
              style={styles.avatar}
              resizeMode="cover"
            />
            <Text style={styles.name}>{userName || "SmartDebt User"}</Text>
          </>
        )}
      </View>

      <View style={styles.menu}>
        {menu.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            activeOpacity={0.85}
            onPress={item.onPress}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>{item.icon}</View>
              <View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
              </View>
            </View>
            <CaretRight size={scale(18)} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Neutral200,
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
  },
  header: {
    alignItems: "center",
    marginBottom: spacingY._25,
    gap: spacingY._12,
  },
  avatar: {
    width: scale(160),
    height: scale(160),
    borderRadius: radius._30,
    backgroundColor: colors.Neutral300,
  },
  name: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(22),
    textAlign: "center",
  },
  menu: {
    gap: spacingY._12,
  },
  menuItem: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._12,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "85%",
    alignSelf: "center",
    marginBottom: spacingY._12,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  menuIcon: {
    width: scale(28),
    height: scale(28),
    borderRadius: radius._10,
    backgroundColor: "rgba(50,117,241,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(14),
  },
  menuSub: {
    color: colors.Neutral100,
    fontFamily: "RobotoRegular",
    fontSize: scale(12),
    marginTop: spacingY._3,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
  },
});

export default ProfileScreen;
