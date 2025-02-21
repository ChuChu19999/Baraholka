import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getProducts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          'Произошла ошибка при загрузке товаров'
      );
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.getProduct(slug);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке товара:', error.response);

      if (error.response?.status === 404) {
        return rejectWithValue(
          'Товар не найден. Возможно, у вас нет прав для просмотра этого товара.'
        );
      }

      return rejectWithValue(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          'Произошла ошибка при загрузке товара. Пожалуйста, попробуйте позже.'
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (data, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const response = await api.createProduct(data, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Произошла ошибка при создании товара');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ slug, data }, { rejectWithValue }) => {
    try {
      const response = await api.updateProduct(slug, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (slug, { rejectWithValue }) => {
    try {
      await api.deleteProduct(slug);
      return slug;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMyProducts = createAsyncThunk(
  'products/fetchMyProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getMyProducts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'products/toggleFavorite',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.toggleFavorite(slug);
      return { slug, status: response.data.status };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateProductStatus = createAsyncThunk(
  'products/updateProductStatus',
  async ({ slug, status }, { rejectWithValue }) => {
    try {
      const response = await api.updateProduct(slug, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Произошла ошибка при обновлении статуса');
    }
  }
);

const initialState = {
  items: [],
  currentProduct: null,
  myProducts: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    clearCurrentProduct: state => {
      state.currentProduct = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Получение списка товаров
      .addCase(fetchProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = action.payload.results;
        state.totalPages = Math.ceil(action.payload.count / 12);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Получение одного товара
      .addCase(fetchProduct.pending, state => {
        state.loading = true;
        state.error = null;
        state.currentProduct = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentProduct = null;
      })

      // Создание товара
      .addCase(createProduct.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Обновление товара
      .addCase(updateProduct.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
        state.items = state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Удаление товара
      .addCase(deleteProduct.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.slug !== action.payload);
        if (state.currentProduct?.slug === action.payload) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Получение моих товаров
      .addCase(fetchMyProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.myProducts = action.payload;
      })
      .addCase(fetchMyProducts.rejected, (state, action) => {
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
        if (state.currentProduct && state.currentProduct.slug === action.payload.slug) {
          state.currentProduct.is_favorite = action.payload.status === 'added to favorites';
        }
        state.items = state.items.map(item => {
          if (item.slug === action.payload.slug) {
            return {
              ...item,
              is_favorite: action.payload.status === 'added to favorites',
            };
          }
          return item;
        });
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Обновление статуса товара
      .addCase(updateProductStatus.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
        state.items = state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        );
        state.myProducts = state.myProducts.map(item =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentPage, clearError, clearCurrentProduct } = productsSlice.actions;

export default productsSlice.reducer;
