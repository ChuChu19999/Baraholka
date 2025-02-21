import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api';
import { setAuth } from './authSlice';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.getProfile();

      // Обновляем данные пользователя в auth slice
      if (response.data?.user) {
        dispatch(
          setAuth({
            isAuthenticated: true,
            user: response.data.user,
          })
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Произошла ошибка при загрузке профиля');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      console.log('Отправка данных профиля:', profileData);

      // Формируем данные для обновления
      const updateData = {
        user: {
          // Отправляем только измененные поля
          ...(profileData.username && { username: profileData.username }),
          ...(profileData.email && { email: profileData.email }),
          ...(profileData.first_name && { first_name: profileData.first_name }),
          ...(profileData.last_name && { last_name: profileData.last_name }),
        },
        ...(profileData.phone && { phone_number: profileData.phone }),
        ...(profileData.location && { location: profileData.location }),
      };

      // Удаляем пустые объекты
      if (Object.keys(updateData.user).length === 0) {
        delete updateData.user;
      }

      console.log('Отправляемые данные:', updateData);
      const response = await api.updateProfile(updateData);
      console.log('Ответ сервера:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', {
        data: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: error.config,
      });

      // Формируем понятное сообщение об ошибке
      let errorMessage = 'Произошла ошибка при обновлении профиля';
      if (error.response?.data) {
        if (error.response.data.user?.username) {
          errorMessage = `Ошибка в имени пользователя: ${error.response.data.user.username[0]}`;
        } else if (error.response.data.user?.email) {
          errorMessage = `Ошибка в email: ${error.response.data.user.email[0]}`;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearProfile: state => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: builder => {
    builder
      // Получение профиля
      .addCase(fetchProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || action.error.message;
      })

      // Обновление профиля
      .addCase(updateProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || action.error.message;
      })

      // Очищаем данные профиля при выходе из системы
      .addCase('auth/logout/fulfilled', state => {
        state.data = null;
        state.error = null;
        state.loading = false;
      });
  },
});

export const { clearError, clearProfile } = profileSlice.actions;

export default profileSlice.reducer;
