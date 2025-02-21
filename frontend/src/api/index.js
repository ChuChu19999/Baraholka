import axios from './axios';

// Аутентификация
export const login = data => axios.post('/auth/login/', data);
export const register = data => axios.post('/auth/register/', data);
export const logout = () => axios.post('/auth/logout/');
export const checkAuth = () => axios.get('/auth/me/');

// Товары
export const getProducts = params => axios.get('/products/', { params });
export const getProduct = slug => axios.get(`/products/${slug}/`);
export const createProduct = (data, config) => axios.post('/products/', data, config);
export const updateProduct = (slug, data) => axios.patch(`/products/${slug}/`, data);
export const updateProductStatus = (slug, status) => axios.patch(`/products/${slug}/`, { status });
export const deleteProduct = slug => axios.delete(`/products/${slug}/`);
export const toggleFavorite = slug => axios.post(`/products/${slug}/toggle_favorite/`);

// Категории
export const getCategories = () => axios.get('/categories/');
export const getCategory = slug => axios.get(`/categories/${slug}/`);

// Профиль
export const getProfile = () => axios.get('/profiles/my_profile/');
export const updateProfile = data => axios.patch('/profiles/my_profile/', data);

// Избранное
export const getFavorites = () => axios.get('/favorites/');

// Мои товары
export const getMyProducts = () => axios.get('/products/my_products/');

// Чаты
export const getChats = () => axios.get('/chats/');
export const getChat = id => axios.get(`/chats/${id}/`);
export const createChat = productId => axios.post('/chats/', { product: productId });

// Сообщения
export const getChatMessages = chatId => axios.get(`/chats/${chatId}/messages/`);
export const sendMessage = (chatId, text) => axios.post(`/chats/${chatId}/messages/`, { text });
export const markMessagesAsRead = chatId => axios.post(`/chats/${chatId}/messages/mark_as_read/`);
