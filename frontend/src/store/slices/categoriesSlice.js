import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Отправка запроса на получение категорий...');
      const response = await api.getCategories();
      console.log('Ответ от API категорий:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке категорий');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCategories.pending, state => {
        state.loading = true;
        state.error = null;
        console.log('Начало загрузки категорий...');
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        console.log('Категории успешно загружены:', state.items);
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Произошла ошибка при загрузке категорий';
        console.error('Ошибка при загрузке категорий:', state.error);
      });
  },
});

export const { clearError } = categoriesSlice.actions;

export default categoriesSlice.reducer;
