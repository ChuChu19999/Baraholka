import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { initializeAuth } from './store/slices/authSlice';
import { fetchProfile } from './store/slices/profileSlice';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/Home/HomePage';
import ProductListPage from './pages/ProductList/ProductListPage';
import ProductDetailPage from './pages/ProductDetail/ProductDetailPage';
import AddProductPage from './pages/AddProduct/AddProductPage';
import ProfilePage from './pages/Profile/ProfilePage';
import FavoritesPage from './pages/Favorites/FavoritesPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ChatListPage from './pages/Chat/ChatListPage';
import ChatPage from './pages/Chat/ChatPage';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route
            path="/add-product"
            element={
              <PrivateRoute>
                <AddProductPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <FavoritesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <PrivateRoute>
                <ChatListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chats/:chatId"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
