import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProfile, updateProfile } from '../../store/slices/profileSlice';
import { fetchMyProducts } from '../../store/slices/productsSlice';
import { fetchFavorites } from '../../store/slices/favoritesSlice';
import { formatDate } from '../../utils/dateUtils';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

const validationSchema = yup.object({
  username: yup
    .string()
    .required('Введите имя пользователя')
    .min(3, 'Минимум 3 символа')
    .max(50, 'Максимум 50 символов'),
  email: yup.string().email('Введите корректный email').required('Введите email'),
  phone: yup
    .string()
    .matches(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Введите корректный номер телефона'),
  location: yup.string().min(3, 'Минимум 3 символа').max(100, 'Максимум 100 символов'),
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <MotionBox sx={{ py: 3 }} variants={containerVariants} initial="hidden" animate="visible">
          {children}
        </MotionBox>
      )}
    </div>
  );
}

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: profile, loading, error } = useSelector(state => state.profile);
  const { isAuthenticated } = useSelector(state => state.auth);
  const { myProducts, loading: productsLoading } = useSelector(state => state.products);
  const { items: favorites, loading: favoritesLoading } = useSelector(state => state.favorites);

  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);

  // Проверяем авторизацию при монтировании и изменении статуса
  useEffect(() => {
    console.log('ProfilePage useEffect: проверка аутентификации');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('Текущий путь:', window.location.pathname);
    if (!isAuthenticated) {
      console.log('Пользователь не аутентифицирован, редирект на /login');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    console.log('ProfilePage useEffect: загрузка профиля');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('Текущий путь:', window.location.pathname);
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated]);

  // Загружаем данные при переключении вкладок
  useEffect(() => {
    if (isAuthenticated) {
      if (tabValue === 1) {
        dispatch(fetchMyProducts());
      } else if (tabValue === 2) {
        dispatch(fetchFavorites());
      }
    }
  }, [dispatch, tabValue, isAuthenticated]);

  const formik = useFormik({
    initialValues: {
      username: profile?.user?.username || '',
      email: profile?.user?.email || '',
      first_name: profile?.user?.first_name || '',
      last_name: profile?.user?.last_name || '',
      phone: profile?.phone_number || '',
      location: profile?.location || '',
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async values => {
      try {
        // Получаем только измененные поля
        const changedValues = {};
        Object.keys(values).forEach(key => {
          if (values[key] !== formik.initialValues[key]) {
            changedValues[key] = values[key];
          }
        });

        if (Object.keys(changedValues).length === 0) {
          setIsEditing(false);
          return;
        }

        console.log('Отправка измененных данных:', changedValues);
        await dispatch(updateProfile(changedValues)).unwrap();
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        // Показываем ошибку пользователю
        if (typeof error === 'string') {
          formik.setStatus(error);
        } else {
          formik.setStatus('Произошла ошибка при обновлении профиля');
        }
      }
    },
  });

  useEffect(() => {
    if (profile) {
      console.log('Loaded profile:', profile); // Для отладки
    }
  }, [profile]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAvatarChange = async event => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setAvatar(URL.createObjectURL(file));
      // Здесь будет отправка файла на сервер
      // const formData = new FormData();
      // formData.append('avatar', file);
      // try {
      //   await dispatch(updateProfileAvatar(formData)).unwrap();
      // } catch (error) {
      //   console.error('Error updating avatar:', error);
      // }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string'
            ? error
            : error?.detail || 'Произошла ошибка при загрузке профиля'}
        </Alert>
        <Button variant="contained" onClick={() => dispatch(fetchProfile())}>
          Попробовать снова
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <MotionPaper
        elevation={3}
        sx={{ p: 4 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <MotionBox sx={{ display: 'flex', alignItems: 'center', mb: 4 }} variants={itemVariants}>
          <Box sx={{ position: 'relative', mr: 3 }}>
            <Avatar
              src={avatar || profile?.avatar}
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: isEditing ? 'scale(1.05)' : 'none',
                },
              }}
            >
              {profile?.username?.[0]?.toUpperCase()}
            </Avatar>
            {isEditing && (
              <>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: -8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      minWidth: 'auto',
                      p: '8px',
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        '& .MuiSvgIcon-root': {
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </Button>
                </label>
              </>
            )}
          </Box>
          <Box>
            <Typography variant="h4" gutterBottom>
              {profile?.first_name} {profile?.last_name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              На сайте с {formatDate(profile?.created_at)}
            </Typography>
          </Box>
        </MotionBox>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  color: 'primary.main',
                  opacity: 1,
                },
              },
            }}
          >
            <Tab label="Профиль" />
            <Tab label="Мои объявления" />
            <Tab label="Избранное" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <MotionBox
                        key="edit-buttons"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <Button
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setIsEditing(false);
                            formik.resetForm();
                          }}
                          sx={{ mr: 1 }}
                        >
                          Отмена
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          type="submit"
                          disabled={!formik.dirty || !formik.isValid}
                        >
                          Сохранить
                        </Button>
                      </MotionBox>
                    ) : (
                      <MotionBox
                        key="edit-button"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                          Редактировать
                        </Button>
                      </MotionBox>
                    )}
                  </AnimatePresence>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Имя пользователя"
                  disabled={!isEditing}
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  disabled={!isEditing}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="first_name"
                  name="first_name"
                  label="Имя"
                  disabled={!isEditing}
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="last_name"
                  name="last_name"
                  label="Фамилия"
                  disabled={!isEditing}
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Телефон"
                  disabled={!isEditing}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="location"
                  name="location"
                  label="Местоположение"
                  disabled={!isEditing}
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                />
              </Grid>

              {/* Добавляем отображение общей ошибки */}
              {formik.status && (
                <Grid item xs={12}>
                  <Alert severity="error" onClose={() => formik.setStatus(null)}>
                    {formik.status}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </form>

          <Divider sx={{ my: 4 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Статистика
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <MotionPaper
                  sx={{ p: 2, textAlign: 'center' }}
                  whileHover={{ y: -4, boxShadow: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography variant="h4" color="primary">
                    {myProducts?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Активных объявлений
                  </Typography>
                </MotionPaper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <MotionPaper
                  sx={{ p: 2, textAlign: 'center' }}
                  whileHover={{ y: -4, boxShadow: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography variant="h4" color="primary">
                    {profile?.sold_products_count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Проданных товаров
                  </Typography>
                </MotionPaper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <MotionPaper
                  sx={{ p: 2, textAlign: 'center' }}
                  whileHover={{ y: -4, boxShadow: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography variant="h4" color="primary">
                    {profile?.rating || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Рейтинг продавца
                  </Typography>
                </MotionPaper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {productsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : myProducts?.length > 0 ? (
            <Grid container spacing={3}>
              {myProducts.map(product => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <MotionPaper
                    component={motion.div}
                    whileHover={{ y: -8, boxShadow: 4 }}
                    sx={{ p: 2, height: '100%', cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${product.slug}`)}
                  >
                    {product.main_image && (
                      <Box
                        component="img"
                        src={product.main_image}
                        alt={product.title}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 1,
                          mb: 2,
                        }}
                      />
                    )}
                    <Typography variant="h6" gutterBottom noWrap>
                      {product.title || 'Без названия'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {product.category_name || 'Без категории'}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                      }).format(product.price || 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Просмотров: {product.views_count || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Статус:{' '}
                      {product.status === 'active'
                        ? 'Активно'
                        : product.status === 'sold'
                          ? 'Продано'
                          : 'В архиве'}
                    </Typography>
                  </MotionPaper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                У вас пока нет объявлений
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/add-product')}
                sx={{ mt: 2 }}
              >
                Создать объявление
              </Button>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {favoritesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : favorites?.length > 0 ? (
            <Grid container spacing={3}>
              {favorites.map(favorite => (
                <Grid item xs={12} sm={6} md={4} key={favorite.id}>
                  <MotionPaper
                    component={motion.div}
                    whileHover={{ y: -8, boxShadow: 4 }}
                    sx={{ p: 2, height: '100%', cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${favorite.product.slug}`)}
                  >
                    {favorite.product.main_image && (
                      <Box
                        component="img"
                        src={favorite.product.main_image}
                        alt={favorite.product.title}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 1,
                          mb: 2,
                        }}
                      />
                    )}
                    <Typography variant="h6" gutterBottom noWrap>
                      {favorite.product.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {favorite.product.category_name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                      }).format(favorite.product.price)}
                    </Typography>
                  </MotionPaper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" color="text.secondary">
                У вас пока нет избранных товаров
              </Typography>
            </Box>
          )}
        </TabPanel>
      </MotionPaper>
    </Container>
  );
}

export default ProfilePage;
