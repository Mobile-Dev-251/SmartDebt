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
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead, updatePushToken } from "@/service/userService";
import { storage } from "@/utils/storage";
import { useDispatch, useSelector } from "react-redux";
// Giả sử markAsRead trong store của bạn đã có logic: state.unreadCount -= 1
import { markAsRead, markAllAsReadForUser } from "@/store/notifications"; 
import { RootState } from "@/store/store";
import { formatDateTimeVN } from "@/utils/dateUtils";

type NotificationItem = {
  id: string;
  dateLabel: string;
  content: string;
  avatar_url?: string;
  isRead: boolean; // <--- THÊM TRƯỜNG NÀY ĐỂ TRACK TRẠNG THÁI
  payload: {
    id?: string;
    type?: string;
    typeValue?: "lend" | "borrow" | "group";
    name?: string;
    note?: string;
    amount?: string;
    borrowDate?: string;
    dueDate?: string;
    remind?: string;
    group?: string;
    paidStatus?: string;
    paidCount?: number;
    totalCount?: number;
  };
};

const NotificationsScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  // Lấy danh sách ID đã đọc từ Redux (nếu cần dùng để filter thêm)
  const { readNotificationIds } = useSelector((state: RootState) => state.notifications);
  
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>("Đang kiểm tra...");
  const [isLoading, setIsLoading] = useState(false);
  const [notificationReceived, setNotificationReceived] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchNotifications();
    checkPermissions();
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setPushToken(token);
        // Gửi token lên server
        try {
          await updatePushToken(token);
          console.log("Push token updated successfully");
        } catch (error) {
          console.error("Failed to update push token:", error);
        }
      }
    });

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotificationReceived(notification);
        fetchNotifications();
      }
    );

    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.debtId) {
             router.push({
                pathname: "/transaction-detail",
                params: { id: data.debtId } as any,
              });
        } else if (data?.typeValue) {
          router.push({
            pathname: "/transaction-detail",
            params: data as any,
          });
        }
      }
    );

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [router]);

  const fetchNotifications = async () => {
      try {
          const res: any = await getMyNotifications();
          if (Array.isArray(res)) {
              const mapped = res.map((item: any) => ({
                  id: item.id.toString(),
                  dateLabel: formatDateTimeVN(item.created_at),
                  content: item.body || item.title,
                  avatar_url: item.avatar_url,
                  // Map is_read từ DB
                  isRead: item.is_read || false,
                  payload: {
                      id: item.debt_id?.toString(),
                  }
              }));
              setNotifications(mapped.reverse());
          }
      } catch (error) {
          console.error("Failed to fetch notifications", error);
      }
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status === "granted" ? "Đã cấp quyền" : status === "denied" ? "Đã từ chối" : "Chưa cấp quyền");
  };

  const handleTestNotification = async () => { /* ... Giữ nguyên logic cũ ... */ };
  const handleRequestPermission = async () => { /* ... Giữ nguyên logic cũ ... */ };

  // Xử lý khi bấm vào thông báo
  const handleNotificationPress = async (item: NotificationItem) => {
    // 1. Nếu chưa đọc -> Gọi API và Dispatch Redux để giảm số
    if (!item.isRead) {
        try {
            // Cập nhật giao diện ngay lập tức (Optimistic UI update)
            setNotifications(prev => prev.map(n => 
                n.id === item.id ? { ...n, isRead: true } : n
            ));

            // Gọi API báo server đã đọc
            await markNotificationAsRead(Number(item.id));
            
            // Dispatch lên Redux để component bên ngoài (Badge số) cập nhật
            dispatch(markAsRead(item.id)); 
        } catch (error) {
            console.warn("Failed to mark notification as read", error);
        }
    }

    // 2. Điều hướng
    if (item.payload.id) {
         router.push({
            pathname: "/transaction-detail",
            params: item.payload as any,
         });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Cập nhật giao diện ngay lập tức
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      // Gọi API
      await markAllNotificationsAsRead();

      // Dispatch lên Redux
      dispatch(markAllAsReadForUser());
    } catch (error) {
      console.warn("Failed to mark all notifications as read", error);
      // Revert on error
      fetchNotifications();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={scale(22)} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: scale(22) }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ... (Giữ nguyên phần Test Section nếu cần) ... */}

        <Text style={styles.sectionTitle}>Thông báo của bạn</Text>
        {notifications.some(n => !n.isRead) && (
          <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc</Text>
          </TouchableOpacity>
        )}
        {notifications.length === 0 ? (
             <Text style={{color: '#888', textAlign: 'center', marginTop: 20}}>Chưa có thông báo nào</Text>
        ) : (
            notifications.map((item) => (
            <TouchableOpacity
                key={item.id}
                // Thêm style mờ đi nếu đã đọc
                style={[styles.card, item.isRead && { opacity: 0.6 }]} 
                activeOpacity={0.9}
                onPress={() => handleNotificationPress(item)}
            >
                {/* Hiển thị chấm đỏ nếu chưa đọc */}
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={styles.date}>{item.dateLabel}</Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                
                <View style={styles.row}>
                {item.avatar_url ? (
                     <Image source={{ uri: item.avatar_url }} style={styles.avatar} resizeMode="cover"/>
                ) : (
                    <Image source={require("@/assets/images/1.png")} style={styles.avatar} resizeMode="cover"/>
                )}
                <Text style={[
                    styles.content, 
                    // Nếu chưa đọc thì in đậm text
                    !item.isRead && { fontFamily: "RobotoBold", color: "#FFF" } 
                ]}>{item.content}</Text>
                </View>
            </TouchableOpacity>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (Giữ nguyên các styles cũ) ...
  container: { flex: 1, backgroundColor: colors.Neutral200 },
  header: { height: spacingY._60, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacingX._20 },
  backButton: { width: scale(32), height: scale(32), alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontFamily: "RobotoBold", fontSize: scale(22), fontWeight: "800" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacingX._20, paddingBottom: spacingY._20, gap: spacingY._12 },
  card: { gap: spacingY._7, backgroundColor: colors.Neutral300, padding: 12, borderRadius: 12 }, // Thêm bg cho card để dễ nhìn
  date: { color: "#AAAAAA", fontFamily: "RobotoRegular", fontSize: scale(12) },
  row: { flexDirection: "row", gap: spacingX._12, alignItems: 'center' },
  avatar: { width: scale(48), height: scale(48), borderRadius: radius._12, backgroundColor: colors.Neutral200 },
  content: { flex: 1, color: "#DDDDDD", fontFamily: "RobotoRegular", fontSize: scale(14), lineHeight: scale(20) },
  sectionTitle: { color: "#FFFFFF", fontFamily: "RobotoBold", fontSize: scale(16), marginBottom: spacingY._12, marginTop: spacingY._7 },
  markAllButton: { alignSelf: 'flex-end', marginBottom: spacingY._12 },
  markAllText: { color: colors.primary300, fontFamily: "RobotoBold", fontSize: scale(14) },
  
  // Style mới cho chấm chưa đọc
  unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FF5252',
  }
});

export default NotificationsScreen;