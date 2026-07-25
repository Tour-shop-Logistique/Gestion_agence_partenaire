import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsApi } from '../../utils/api/notifications';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const result = await notificationsApi.listNotifications();
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return { notifications: result.notifications, nonLues: result.nonLues };
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération des notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const result = await notificationsApi.markAsRead(notificationId);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors du marquage comme lue');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const result = await notificationsApi.markAllAsRead();
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors du marquage global');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { rejectWithValue }) => {
    try {
      const result = await notificationsApi.deleteNotification(notificationId);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la suppression');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Reçu en temps réel via WebSocket (canal agence.{id}, event Announcement/created)
    announcementReceived: (state, action) => {
      const announcements = Array.isArray(action.payload) ? action.payload : [action.payload];
      announcements.forEach((a) => {
        if (!state.items.some((item) => item.id === a.id)) {
          state.items.unshift(a);
          if (!a.lu) state.unreadCount += 1;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.nonLues;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload);
        if (item && !item.lu) {
          item.lu = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.lu = true; });
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload);
        if (item && !item.lu) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((n) => n.id !== action.payload);
      });
  },
});

export const { announcementReceived } = notificationsSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsStatus = (state) => state.notifications.status;

export default notificationsSlice.reducer;
