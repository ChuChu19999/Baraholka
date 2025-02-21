import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api';

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, { rejectWithValue }) => {
  try {
    console.log('Запрос списка чатов');
    const response = await api.getChats();
    console.log('Ответ от сервера (чаты):', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка чатов:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return rejectWithValue({
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
  }
});

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async (chatId, { rejectWithValue }) => {
    try {
      console.log('chatSlice: Запрос сообщений чата:', chatId);
      const response = await api.getChatMessages(chatId);
      console.log('chatSlice: Ответ от сервера (сообщения):', response.data);
      return response.data;
    } catch (error) {
      console.error('chatSlice: Ошибка при получении сообщений:', {
        chatId,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return rejectWithValue({
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, text }, { rejectWithValue }) => {
    try {
      const response = await api.sendMessage(chatId, text);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.createChat(productId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (chatId, { rejectWithValue }) => {
    try {
      await api.markMessagesAsRead(chatId);
      return chatId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Получение списка чатов
      .addCase(fetchChats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        // Проверяем, есть ли результаты в ответе
        state.chats = action.payload?.results || action.payload || [];
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        console.error('Ошибка при загрузке чатов:', action.payload);
        state.error =
          action.payload?.data?.detail || action.payload?.message || 'Ошибка при загрузке чатов';
        // Очищаем текущий чат при ошибке
        state.currentChat = null;
      })

      // Получение сообщений чата
      .addCase(fetchChatMessages.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        console.log('chatSlice: Обработка полученных сообщений:', action.payload);
        // Убедимся, что у нас есть массив сообщений
        const messages = action.payload?.results || action.payload || [];
        // Преобразуем каждое сообщение, добавляя информацию об отправителе
        state.messages = messages.map(message => ({
          id: message.id,
          text: message.text,
          sender: message.sender,
          sender_username: message.sender_username,
          created_at: message.created_at,
          is_read: message.is_read,
        }));
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        console.error('chatSlice: Ошибка при загрузке сообщений:', action.payload);
        state.error =
          action.payload?.data?.detail ||
          action.payload?.message ||
          'Ошибка при загрузке сообщений';
        // Не очищаем currentChat при ошибке загрузки сообщений
      })

      // Отправка сообщения
      .addCase(sendMessage.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Ответ сервера при отправке сообщения:', action.payload);

        // Проверяем, что пришло от сервера
        const newMessage = action.payload;
        if (newMessage && typeof newMessage === 'object' && newMessage.text) {
          // Инициализируем массив сообщений, если его нет
          if (!Array.isArray(state.messages)) {
            state.messages = [];
          }
          // Добавляем новое сообщение в массив с полной информацией об отправителе
          state.messages.push({
            id: newMessage.id,
            text: newMessage.text,
            sender: newMessage.sender,
            sender_username: newMessage.sender_username,
            created_at: newMessage.created_at,
            is_read: newMessage.is_read,
          });
        } else {
          console.error('Некорректный формат сообщения:', newMessage);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        console.error('Ошибка при отправке сообщения:', action.payload);
        state.error = action.payload?.detail || 'Ошибка при отправке сообщения';
      })

      // Создание чата
      .addCase(createChat.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.loading = false;
        const newChat = action.payload;

        // Проверяем, что получили корректный объект чата
        if (newChat && typeof newChat === 'object' && newChat.id) {
          console.log('Создан новый чат:', newChat);

          // Добавляем чат в список и устанавливаем как текущий
          if (!Array.isArray(state.chats)) {
            state.chats = [];
          }
          state.chats.unshift(newChat);
          state.currentChat = newChat;
          state.messages = []; // Очищаем сообщения при создании нового чата
        } else {
          console.error('Некорректный ответ при создании чата:', newChat);
          state.error = 'Ошибка при создании чата';
        }
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Ошибка при создании чата';
      })

      // Отметка сообщений как прочитанных
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const chatId = action.payload;
        if (Array.isArray(state.messages)) {
          state.messages = state.messages.map(message => ({
            ...message,
            is_read: true,
          }));
        }
        if (Array.isArray(state.chats)) {
          state.chats = state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                unread_count: 0,
              };
            }
            return chat;
          });
        }
      });
  },
});

export const { clearError, setCurrentChat } = chatSlice.actions;

export default chatSlice.reducer;
