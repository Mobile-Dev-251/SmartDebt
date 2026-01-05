import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
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

type MenuItem = {
  id: string;
  label: string;
  sub?: string;
  icon: React.ReactNode;
  onPress: () => void;
};

const ProfileScreen = () => {
  const router = useRouter();

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
      onPress: () => alert("Đăng xuất (chưa triển khai)"),
      icon: (
        <SignOut size={scale(18)} color={colors.primary300} weight="bold" />
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/1.png")}
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text style={styles.name}>Hoàng Phương Bình</Text>
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
