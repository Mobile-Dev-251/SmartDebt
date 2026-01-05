import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell } from "phosphor-react-native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotificationsAsync,
  schedulePushNotification,
} from "@/utils/notifications";

type NotificationItem = {
  id: string;
  dateLabel: string;
  content: string;
  payload: {
    type: string;
    typeValue: "lend" | "borrow" | "group";
    name: string;
    note: string;
    amount: string;
    borrowDate: string;
    dueDate: string;
    remind: string;
    group?: string;
    paidStatus?: string;
    paidCount?: number;
    totalCount?: number;
  };
};

const notifications: NotificationItem[] = [
  {
    id: "1",
    dateLabel: "Ngày 5, tháng 11, năm 2025",
    content:
      "Hoàng Phương Bình xác nhận đã trả 50.000đ cho bạn. Bấm để xác nhận",
    payload: {
      type: "Cho mượn",
      typeValue: "lend",
      name: "Hoàng Phương Bình",
      note: "Xác nhận trả",
      amount: "50.000đ",
      borrowDate: "01/12/2025",
      dueDate: "01/01/2026",
      remind: "Trước 1 ngày (lặp lại)",
      paidStatus: "pending",
    },
  },
  {
    id: "2",
    dateLabel: "Ngày 3, tháng 11, năm 2025",
    content:
      "Bạn cần trả 50.000đ đã mượn của Hoàng Phương Bình vào ngày 1/11/2025. Bấm để xác nhận trả tiền",
    payload: {
      type: "Mượn nợ",
      typeValue: "borrow",
      name: "Hoàng Phương Bình",
      note: "Thanh toán",
      amount: "50.000đ",
      borrowDate: "01/12/2025",
      dueDate: "01/01/2026",
      remind: "Trước 1 ngày (lặp lại)",
      paidStatus: "unpaid",
    },
  },
];

const NotificationsScreen = () => {
  const router = useRouter();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>("Đang kiểm tra...");
  const [isLoading, setIsLoading] = useState(false);
  const [notificationReceived, setNotificationReceived] = useState<any>(null);

  useEffect(() => {
    // Kiểm tra quyền thông báo
    checkPermissions();

    // Lấy push token
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setPushToken(token);
        console.log("Push token:", token);
      }
    });

    // Lắng nghe thông báo đến
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        setNotificationReceived(notification);
        Alert.alert(
          "Thông báo mới",
          notification.request.content.body || "Bạn có thông báo mới",
          [{ text: "OK" }]
        );
      }
    );

    // Lắng nghe khi người dùng nhấn vào thông báo
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification response:", response);
        const data = response.notification.request.content.data;
        if (data?.typeValue) {
          router.push({
            pathname: "/transaction-detail",
            params: data,
          });
        }
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [router]);

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") {
      setPermissionStatus("Đã cấp quyền");
    } else if (status === "denied") {
      setPermissionStatus("Đã từ chối");
    } else {
      setPermissionStatus("Chưa cấp quyền");
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      await schedulePushNotification(
        "Thông báo test",
        "Đây là thông báo test từ SmartDebt. Bạn đã nhận được thông báo thành công!",
        {
          type: "Cho mượn",
          typeValue: "lend",
          name: "Test User",
          note: "Test notification",
          amount: "0đ",
          borrowDate: new Date().toISOString(),
          dueDate: new Date().toISOString(),
          remind: "Test",
        }
      );
      Alert.alert("Thành công", "Đã gửi thông báo test!");
    } catch (error) {
      console.error("Error sending test notification:", error);
      Alert.alert("Lỗi", "Không thể gửi thông báo test");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      setPermissionStatus("Đã cấp quyền");
      Alert.alert("Thành công", "Đã cấp quyền thông báo!");
      // Lấy lại token sau khi cấp quyền
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
      }
    } else {
      setPermissionStatus("Đã từ chối");
      Alert.alert("Thất bại", "Bạn cần cấp quyền thông báo để sử dụng tính năng này");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={scale(22)} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: scale(22) }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Test Section */}
        <View style={styles.testSection}>
          <View style={styles.testHeader}>
            <Bell size={scale(20)} color="#FFFFFF" weight="bold" />
            <Text style={styles.testTitle}>Test thông báo đẩy</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Trạng thái quyền:</Text>
            <Text style={styles.infoValue}>{permissionStatus}</Text>
          </View>

          {permissionStatus !== "Đã cấp quyền" && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleRequestPermission}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Yêu cầu quyền thông báo</Text>
            </TouchableOpacity>
          )}

          {pushToken && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Push Token:</Text>
              <Text style={styles.tokenText} numberOfLines={2}>
                {pushToken}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.testButton, isLoading && styles.testButtonDisabled]}
            onPress={handleTestNotification}
            disabled={isLoading || permissionStatus !== "Đã cấp quyền"}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Gửi thông báo test</Text>
            )}
          </TouchableOpacity>

          {notificationReceived && (
            <View style={styles.receivedCard}>
              <Text style={styles.receivedTitle}>Thông báo vừa nhận:</Text>
              <Text style={styles.receivedText}>
                {notificationReceived.request.content.title}
              </Text>
              <Text style={styles.receivedBody}>
                {notificationReceived.request.content.body}
              </Text>
            </View>
          )}
        </View>

        {/* Notifications List */}
        <Text style={styles.sectionTitle}>Thông báo của bạn</Text>
        {notifications.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/transaction-detail",
                params: item.payload,
              })
            }
          >
            <Text style={styles.date}>{item.dateLabel}</Text>
            <View style={styles.row}>
              <Image
                source={require("@/assets/images/1.png")}
                style={styles.avatar}
                resizeMode="cover"
              />
              <Text style={styles.content}>{item.content}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    height: spacingY._60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
  },
  backButton: {
    width: scale(32),
    height: scale(32),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(22),
    fontWeight: "800",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
    gap: spacingY._12,
  },
  card: {
    gap: spacingY._7,
  },
  date: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(13),
  },
  row: {
    flexDirection: "row",
    gap: spacingX._12,
  },
  avatar: {
    width: scale(54),
    height: scale(54),
    borderRadius: radius._12,
    backgroundColor: colors.Neutral300,
  },
  content: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
    lineHeight: scale(20),
  },
  testSection: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._20,
    gap: spacingY._12,
  },
  testHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    marginBottom: spacingY._7,
  },
  testTitle: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: colors.Neutral200,
    borderRadius: radius._10,
    padding: spacingX._12,
    gap: spacingY._3,
  },
  infoLabel: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(12),
    opacity: 0.7,
  },
  infoValue: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(14),
  },
  tokenText: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(11),
    opacity: 0.8,
  },
  testButton: {
    backgroundColor: "#4CAF50",
    borderRadius: radius._10,
    paddingVertical: spacingY._12,
    paddingHorizontal: spacingX._15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: scale(44),
  },
  testButtonDisabled: {
    backgroundColor: colors.Neutral300,
    opacity: 0.5,
  },
  permissionButton: {
    backgroundColor: "#2196F3",
    borderRadius: radius._10,
    paddingVertical: spacingY._12,
    paddingHorizontal: spacingX._15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: scale(44),
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(14),
    fontWeight: "600",
  },
  receivedCard: {
    backgroundColor: "#4CAF50",
    borderRadius: radius._10,
    padding: spacingX._12,
    gap: spacingY._3,
  },
  receivedTitle: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(12),
    opacity: 0.9,
  },
  receivedText: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(14),
  },
  receivedBody: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(12),
    opacity: 0.9,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
    marginBottom: spacingY._12,
    marginTop: spacingY._7,
  },
});

export default NotificationsScreen;






