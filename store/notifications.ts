import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationItem {
  id: string;
  is_read: boolean;
  // Add other fields as needed
}

interface NotificationsState {
  notifications: NotificationItem[];
  readNotificationIds: string[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  notifications: [],
  readNotificationIds: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<any[]>) => {
      // Transform API response to NotificationItem format
      state.notifications = action.payload.map(item => ({
        id: item.id.toString(),
        is_read: item.is_read || false,
      }));
      
      // Initialize readNotificationIds based on is_read field
      state.readNotificationIds = state.notifications
        .filter(n => n.is_read)
        .map(n => n.id);
      
      // Recalculate unread count based on readNotificationIds
      state.unreadCount = state.notifications.filter(n => !state.readNotificationIds.includes(n.id)).length;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (!state.readNotificationIds.includes(id)) {
        state.readNotificationIds.push(id);
        if (state.unreadCount > 0) {
            state.unreadCount -= 1;
        }
      }
    },
    markAllAsRead: (state, action: PayloadAction<string[]>) => {
        // Option to mark all current visible as read if needed, though user asked for "click to reduce"
        // keeping this just in case.
        const ids = action.payload;
        ids.forEach(id => {
            if (!state.readNotificationIds.includes(id)) {
                state.readNotificationIds.push(id);
            }
        });
        state.unreadCount = 0;
    },
    markAllAsReadForUser: (state) => {
        // Mark all notifications as read
        state.notifications.forEach(notification => {
            if (!state.readNotificationIds.includes(notification.id)) {
                state.readNotificationIds.push(notification.id);
            }
        });
        state.unreadCount = 0;
    }
  },
});

export const { setNotifications, setUnreadCount, markAsRead, markAllAsRead, markAllAsReadForUser } = notificationsSlice.actions;
export default notificationsSlice.reducer;
