import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messagesApi } from '../../utils/api/messages';

export const fetchConversation = createAsyncThunk(
  'messages/fetchConversation',
  async (_, { rejectWithValue }) => {
    try {
      const result = await messagesApi.showConversation();
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return { conversationId: result.conversationId, messages: result.messages };
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération de la conversation');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/send',
  async ({ body, attachments }, { rejectWithValue }) => {
    try {
      const result = await messagesApi.sendMessage({ body, attachments });
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.sentMessage;
    } catch (error) {
      return rejectWithValue(error.message || "Erreur lors de l'envoi du message");
    }
  }
);

export const searchMessages = createAsyncThunk(
  'messages/search',
  async (q, { rejectWithValue }) => {
    try {
      const result = await messagesApi.searchMessages(q);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.messages;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la recherche');
    }
  }
);

export const updateMessage = createAsyncThunk(
  'messages/update',
  async ({ messageId, body }, { rejectWithValue }) => {
    try {
      const result = await messagesApi.updateMessage(messageId, body);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.updatedMessage;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la modification');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/delete',
  async (messageId, { rejectWithValue }) => {
    try {
      const result = await messagesApi.deleteMessage(messageId);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message || 'Erreur lors de la suppression');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    items: [],
    conversationId: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    isSending: false,
    unreadCount: 0,
    searchResults: null,
    isSearching: false,
    error: null,
  },
  reducers: {
    // Reçu en temps réel via WebSocket (canal agence.{id}, event Message/created)
    messageReceived: (state, action) => {
      const message = action.payload;
      if (!state.items.some((m) => m.id === message.id)) {
        state.items.push(message);
        if (message.sender?.type !== 'agence') {
          state.unreadCount += 1;
        }
      }
    },
    // Reçu en temps réel : message modifié par l'autre partie (event Message/updated)
    messageUpdated: (state, action) => {
      const message = action.payload;
      const idx = state.items.findIndex((m) => m.id === message.id);
      if (idx !== -1) state.items[idx] = message;
    },
    // Reçu en temps réel : message supprimé par l'autre partie (event Message/deleted)
    messageDeleted: (state, action) => {
      state.items = state.items.filter((m) => m.id !== action.payload);
    },
    clearSearch: (state) => {
      state.searchResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.conversationId = action.payload.conversationId;
        state.items = action.payload.messages;
        state.unreadCount = 0;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        if (!state.items.some((m) => m.id === action.payload.id)) {
          state.items.push(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      })
      .addCase(searchMessages.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchMessages.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchMessages.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      })
      .addCase(updateMessage.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      });
  },
});

export const { messageReceived, messageUpdated, messageDeleted, clearSearch } = messagesSlice.actions;

export const selectMessages = (state) => state.messages.items;
export const selectMessagesStatus = (state) => state.messages.status;
export const selectUnreadMessagesCount = (state) => state.messages.unreadCount;

export default messagesSlice.reducer;
