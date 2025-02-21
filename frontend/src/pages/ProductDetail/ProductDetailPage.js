import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Avatar,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  Image as ImageIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchProduct,
  toggleFavorite,
  updateProductStatus,
  clearCurrentProduct,
  clearError,
} from '../../store/slices/productsSlice';
import { createChat } from '../../store/slices/chatSlice';
import { formatDateTime } from '../../utils/dateUtils';

const MotionBox = motion(Box);

const ImagePlaceholder = ({ title }) => (
  <Box
    sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'grey.100',
      borderRadius: 2,
      color: 'text.secondary',
    }}
  >
    <ImageIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
    <Typography variant="body1" sx={{ opacity: 0.7 }}>
      Изображение отсутствует
    </Typography>
  </Box>
);

const statusLabels = {
  active: 'Активно',
  archived: 'В архиве',
  sold: 'Продано',
};

function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct: product, loading, error } = useSelector(state => state.products);
  const { user } = useSelector(state => state.auth);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch]);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProduct(slug))
        .unwrap()
        .catch(error => {
          console.error('Ошибка при загрузке товара:', error);
        });
    }
  }, [dispatch, slug]);

  useEffect(() => {
    if (product && user) {
      console.log('Текущий пользователь:', {
        id: user.id,
        username: user.username,
      });
      console.log('Продавец:', {
        id: product.seller?.id,
        username: product.seller?.username,
      });
      console.log('Сравнение ID:', user.id === product.seller?.id);
    }
  }, [product, user]);

  useEffect(() => {
    const handleKeyPress = e => {
      if (selectedImage) {
        if (e.key === 'ArrowLeft') {
          handlePrevImage();
        } else if (e.key === 'ArrowRight') {
          handleNextImage();
        } else if (e.key === 'Escape') {
          handleCloseDialog();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, currentImageIndex]);

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

  const handlePrevImage = () => {
    if (product?.images?.length) {
      const newIndex = currentImageIndex === 0 ? product.images.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(product.images[newIndex].image);
    }
  };

  const handleNextImage = () => {
    if (product?.images?.length) {
      const newIndex = currentImageIndex === product.images.length - 1 ? 0 : currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(product.images[newIndex].image);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await dispatch(toggleFavorite(slug)).unwrap();
    } catch (error) {
      if (!localStorage.getItem('token')) {
        navigate('/login');
      }
    }
  };

  const handleStartChat = async () => {
    try {
      const result = await dispatch(createChat(product.id)).unwrap();
      navigate(`/chats/${result.id}`);
    } catch (error) {
      if (!localStorage.getItem('token')) {
        navigate('/login');
      }
    }
  };

  const handleMenuClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async newStatus => {
    try {
      setStatusUpdateLoading(true);
      setStatusUpdateError(null);

      const response = await dispatch(updateProductStatus({ slug, status: newStatus })).unwrap();
      handleMenuClose();
    } catch (error) {
      setStatusUpdateError('Ошибка при обновлении статуса объявления');
      console.error('Ошибка при обновлении статуса:', error);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Загрузка информации о товаре...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                dispatch(clearError());
                dispatch(fetchProduct(slug));
              }}
            >
              Повторить
            </Button>
          }
        >
          {typeof error === 'string' ? error : 'Произошла ошибка при загрузке товара'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/products')}
          startIcon={<ArrowBackIcon />}
        >
          Вернуться к списку товаров
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Товар не найден или у вас нет прав для его просмотра
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/products')}
          startIcon={<ArrowBackIcon />}
        >
          Вернуться к списку товаров
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Галерея изображений */}
        <Grid item xs={12} md={7}>
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 400,
                mb: 2,
                cursor: product.images?.length ? 'pointer' : 'default',
              }}
              onClick={() =>
                product.images?.length &&
                handleImageClick(product.images[currentImageIndex]?.image, currentImageIndex)
              }
            >
              {product.images?.length ? (
                <img
                  src={product.images[currentImageIndex]?.image}
                  alt={product.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
              ) : (
                <ImagePlaceholder title={product.title} />
              )}
            </Box>
            {product.images?.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                {product.images.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 80,
                      height: 80,
                      flexShrink: 0,
                      cursor: 'pointer',
                      border: index === currentImageIndex ? '2px solid #2196f3' : 'none',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                    onClick={() => handleImageClick(image.image, index)}
                  >
                    <img
                      src={image.image}
                      alt={`${product.title} ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </MotionBox>
        </Grid>

        {/* Информация о товаре */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {new Intl.NumberFormat('ru-RU').format(product.price)} ₽
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton color="primary" onClick={handleToggleFavorite}>
                    {product.is_favorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                  {user && product.seller && user.id === product.seller.id && (
                    <>
                      <IconButton onClick={handleMenuClick}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                        <MenuItem
                          onClick={() => handleStatusChange('active')}
                          disabled={product.status === 'active' || statusUpdateLoading}
                        >
                          Сделать активным
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleStatusChange('archived')}
                          disabled={product.status === 'archived' || statusUpdateLoading}
                        >
                          Архивировать
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleStatusChange('sold')}
                          disabled={product.status === 'sold' || statusUpdateLoading}
                        >
                          Отметить как проданное
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </Box>
              </Box>

              <Typography variant="h5" gutterBottom>
                {product.title}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip
                  label={product.condition === 'new' ? 'Новый' : 'Б/У'}
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Chip icon={<LocationIcon />} label={product.location} variant="outlined" />
                <Chip
                  label={statusLabels[product.status]}
                  color={product.status === 'active' ? 'success' : 'default'}
                  sx={{ ml: 1 }}
                />
              </Box>

              {statusUpdateError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {statusUpdateError}
                </Alert>
              )}

              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Информация о продавце */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2 }}>{product.seller?.username?.[0]?.toUpperCase()}</Avatar>
                  <Box>
                    <Typography variant="subtitle1">{product.seller?.username}</Typography>
                    {product.seller?.rating && (
                      <Typography variant="body2" color="text.secondary">
                        Рейтинг: {product.seller.rating}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'action.hover',
                    p: 2,
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    {product.seller?.phone_number || 'Телефон не указан'}
                  </Typography>
                </Box>

                {/* Показываем кнопку чата только если пользователь не является владельцем объявления */}
                {user && product.seller && user.id !== product.seller.id && (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ChatIcon />}
                    onClick={handleStartChat}
                    sx={{ mb: 2 }}
                  >
                    Написать продавцу
                  </Button>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Опубликовано: {formatDateTime(product.created_at)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Просмотров: {product.views_count}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Модальное окно для просмотра изображений */}
      <Dialog
        fullScreen
        open={!!selectedImage}
        onClose={handleCloseDialog}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            p: 2,
          }}
        >
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
          }}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={selectedImage}
                alt={product.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </MotionBox>
          </AnimatePresence>
        </DialogContent>
        {product.images?.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Button variant="contained" onClick={handlePrevImage}>
              Предыдущее
            </Button>
            <Button variant="contained" onClick={handleNextImage}>
              Следующее
            </Button>
          </Box>
        )}
      </Dialog>
    </Container>
  );
}

export default ProductDetailPage;
