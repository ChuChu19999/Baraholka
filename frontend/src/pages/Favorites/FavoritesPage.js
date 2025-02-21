import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import { Favorite as FavoriteIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFavorites, toggleFavorite } from '../../store/slices/favoritesSlice';

const MotionCard = motion(Card);
const MotionContainer = motion(Container);

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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

function FavoritesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: favorites = [], loading, error } = useSelector(state => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  useEffect(() => {
    console.log('Favorites data:', favorites);
  }, [favorites]);

  const handleRemoveFromFavorites = async slug => {
    dispatch(toggleFavorite(slug));
  };

  const handleProductClick = slug => {
    navigate(`/products/${slug}`);
  };

  if (loading) {
    return (
      <MotionContainer
        maxWidth="lg"
        sx={{ py: 4 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Typography variant="h4" gutterBottom>
          Избранное
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(item => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MotionContainer>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => dispatch(fetchFavorites())}>
          Попробовать снова
        </Button>
      </Container>
    );
  }

  if (!Array.isArray(favorites) || favorites.length === 0) {
    return (
      <MotionContainer
        maxWidth="lg"
        sx={{ py: 4 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 8,
          }}
        >
          <FavoriteIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
          <Typography variant="h4" gutterBottom>
            В избранном пока ничего нет
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Добавляйте товары в избранное, чтобы не потерять их
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
            sx={{
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s',
              },
            }}
          >
            Перейти к товарам
          </Button>
        </Box>
      </MotionContainer>
    );
  }

  return (
    <MotionContainer
      maxWidth="lg"
      sx={{ py: 4 }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Typography variant="h4" gutterBottom>
        Избранное
      </Typography>

      <Grid container spacing={3}>
        <AnimatePresence mode="popLayout">
          {favorites.map(favorite => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={favorite.id}>
              <MotionCard
                variants={cardVariants}
                layoutId={`favorite-${favorite.id}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme => theme.shadows[8],
                    transition: 'all 0.3s ease-in-out',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={favorite.product.main_image || '/placeholder-image.jpg'}
                  alt={favorite.product.title}
                  onClick={() => handleProductClick(favorite.product.slug)}
                  sx={{
                    '&:hover': {
                      opacity: 0.9,
                      transition: 'opacity 0.2s',
                    },
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'error.light',
                      transform: 'scale(1.1)',
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      },
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    handleRemoveFromFavorites(favorite.product.slug);
                  }}
                >
                  <FavoriteIcon color="error" />
                </IconButton>
                <CardContent
                  sx={{ flexGrow: 1 }}
                  onClick={() => handleProductClick(favorite.product.slug)}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {favorite.product.price.toLocaleString()} ₽
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {favorite.product.title}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={favorite.product.condition === 'new' ? 'Новый' : 'Б/У'}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {favorite.product.location}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Добавлено: {favorite.created_at}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>
    </MotionContainer>
  );
}

export default FavoritesPage;
