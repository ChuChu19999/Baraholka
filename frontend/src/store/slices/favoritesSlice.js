import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api';

export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getFavorites();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavorite',
  async (slug, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.toggleFavorite(slug);
      if (response.data.status === 'added to favorites') {
        // Если товар добавлен в избранное, запрашиваем обновленный список
        await dispatch(fetchFavorites());
      }
      return { slug, status: response.data.status };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Получение избранных товаров
      .addCase(fetchFavorites.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Добавление/удаление из избранного
      .addCase(toggleFavorite.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 'removed from favorites') {
          state.items = state.items.filter(item => item.product.slug !== action.payload.slug);
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = favoritesSlice.actions;

export default favoritesSlice.reducer;
