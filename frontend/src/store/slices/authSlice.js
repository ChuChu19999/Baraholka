import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api';
import { clearProfile } from './profileSlice';

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Отправка данных для входа:', {
        username: credentials.username,
        password: '***', // Не логируем реальный пароль
      });

      const response = await api.login({
        username: credentials.username,
        password: credentials.password,
      });

      // Подробное логирование всего ответа
      console.log('Полный ответ сервера:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      });

      // Проверяем наличие access токена
      if (!response.data?.access) {
        throw new Error('Access токен не получен от сервера');
      }

      // Формируем данные для сохранения
      const responseData = {
        token: response.data.access, // Используем access токен
        user: response.data.user || { username: credentials.username }, // Если нет данных пользователя, создаем базовый объект
      };

      return responseData;
    } catch (error) {
      console.error('Детали ошибки:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        fullError: error,
      });

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        'Произошла ошибка при входе. Проверьте правильность логина и пароля.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try {
    await api.logout();
  } catch (error) {
    console.error('Ошибка при выходе:', error);
  } finally {
    // Очищаем все данные пользователя
    localStorage.removeItem('token');
    dispatch(clearProfile());
    window.location.href = '/login';
  }
});

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
    },
    clearError: state => {
      state.error = null;
    },
    initializeAuth: state => {
      const token = localStorage.getItem('token');
      state.isAuthenticated = !!token;
      if (!token) {
        state.user = null;
      }
    },
  },
  extraReducers: builder => {
    builder
      // Обработка loginAsync
      .addCase(loginAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Ответ от сервера при логине:', action.payload);

        if (!action.payload || typeof action.payload !== 'object') {
          state.error = 'Некорректный ответ от сервера';
          state.isAuthenticated = false;
          state.user = null;
          return;
        }

        if (!action.payload.token) {
          state.error = 'Токен не получен от сервера';
          state.isAuthenticated = false;
          state.user = null;
          return;
        }

        if (!action.payload.user) {
          state.error = 'Данные пользователя не получены';
          state.isAuthenticated = false;
          state.user = null;
          return;
        }

        try {
          localStorage.setItem('token', action.payload.token);
          console.log('Токен успешно сохранен:', action.payload.token.substring(0, 10) + '...');

          state.isAuthenticated = true;
          state.user = action.payload.user;
        } catch (error) {
          console.error('Ошибка при сохранении токена:', error);
          state.error = 'Ошибка при сохранении токена';
          state.isAuthenticated = false;
          state.user = null;
        }
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Произошла ошибка при входе';
        state.isAuthenticated = false;
        state.user = null;
      })
      // Обработка registerAsync
      .addCase(registerAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Произошла ошибка при регистрации';
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.pending, state => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, state => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = null;
        localStorage.removeItem('token');
      })
      .addCase(logout.rejected, state => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('token');
      });
  },
});

export const { setAuth, clearError, initializeAuth } = authSlice.actions;

export default authSlice.reducer;
