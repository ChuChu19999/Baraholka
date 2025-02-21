import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Security as SecurityIcon,
  TouchApp as TouchAppIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const categories = [
  {
    id: 8,
    title: 'Электроника',
    image: '/images/categories/electronics.png',
    path: '/products?category=8',
    subcategories: [
      { id: 9, name: 'Телефоны' },
      { id: 10, name: 'Ноутбуки' },
      { id: 11, name: 'Бытовая техника' },
    ],
  },
  {
    id: 12,
    title: 'Одежда и обувь',
    image: '/images/categories/clothing.jpg',
    path: '/products?category=12',
    subcategories: [
      { id: 13, name: 'Мужская одежда' },
      { id: 14, name: 'Женская одежда' },
    ],
  },
  {
    id: 18,
    title: 'Мебель и интерьер',
    image: '/images/categories/furniture.jpg',
    path: '/products?category=18',
    subcategories: [
      { id: 19, name: 'Мебель для дома' },
      { id: 20, name: 'Предметы интерьера' },
    ],
  },
  {
    id: 21,
    title: 'Хобби и отдых',
    image: '/images/categories/sport.jpg',
    path: '/products?category=21',
    subcategories: [
      { id: 22, name: 'Спортивные товары' },
      { id: 23, name: 'Книги и журналы' },
      { id: 24, name: 'Музыкальные инструменты' },
    ],
  },
];

function HomePage() {
  return (
    <Box>
      {/* Hero секция */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              component="h1"
              variant="h2"
              align="center"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Покупайте и продавайте на Барахолке
            </Typography>
            <Typography variant="h5" align="center" paragraph>
              Простой способ продать ненужные вещи или найти что-то интересное
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                component={RouterLink}
                to="/add-product"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ mr: 2 }}
              >
                Разместить объявление
              </Button>
              <Button
                component={RouterLink}
                to="/products"
                variant="outlined"
                color="inherit"
                size="large"
              >
                Смотреть товары
              </Button>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* Категории */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography component="h2" variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          Популярные категории
        </Typography>
        <Grid container spacing={4}>
          {categories.map(category => (
            <Grid item key={category.id} xs={12} sm={6} md={3}>
              <MotionCard
                component={RouterLink}
                to={category.path}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={category.image}
                  alt={category.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h3" align="center">
                    {category.title}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Преимущества */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Почему выбирают нас
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    mx: 'auto',
                  }}
                >
                  <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 'bold', color: 'primary.main' }}
                >
                  Быстро и просто
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Разместите объявление за несколько минут и начните продавать. Интуитивно понятный
                  интерфейс поможет вам быстро найти нужные товары.
                </Typography>
              </MotionBox>
            </Grid>
            <Grid item xs={12} sm={4}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    mx: 'auto',
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 'bold', color: 'success.main' }}
                >
                  Безопасно
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Мы тщательно проверяем пользователей и следим за безопасностью сделок. Ваши данные
                  надежно защищены.
                </Typography>
              </MotionBox>
            </Grid>
            <Grid item xs={12} sm={4}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    mx: 'auto',
                  }}
                >
                  <TouchAppIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 'bold', color: 'warning.main' }}
                >
                  Удобно
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Продуманная система фильтров, чат с продавцами и возможность следить за
                  интересными товарами в избранном.
                </Typography>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;
