import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider, Stack, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Telegram as TelegramIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme => theme.palette.grey[900],
        color: 'white',
        pt: 6,
        pb: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              О Барахолке
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'grey.400' }}>
              Барахолка - это современная площадка для безопасной купли-продажи товаров. Мы создаем
              удобное пространство для продавцов и покупателей, где каждый может найти нужные товары
              или продать ненужные вещи.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                component="a"
                href="https://facebook.com"
                target="_blank"
                sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://instagram.com"
                target="_blank"
                sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://t.me/baraholka"
                target="_blank"
                sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}
              >
                <TelegramIcon />
              </IconButton>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Навигация
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <Link
                    component={RouterLink}
                    to="/"
                    sx={{
                      color: 'grey.400',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    Главная
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/products"
                    sx={{
                      color: 'grey.400',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    Все товары
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/favorites"
                    sx={{
                      color: 'grey.400',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    Избранное
                  </Link>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <Link
                    component={RouterLink}
                    to="/add-product"
                    sx={{
                      color: 'grey.400',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    Продать товар
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/profile"
                    sx={{
                      color: 'grey.400',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    Личный кабинет
                  </Link>
                  <Link
                    component={RouterLink}
                    to="/help"
                    sx={{
                      color: 'grey.400',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    Помощь
                  </Link>
                </Stack>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Контакты
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'grey.400' }}>
                <PhoneIcon sx={{ mr: 1 }} />
                <Typography variant="body2">8 800 555-35-35</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'grey.400' }}>
                <EmailIcon sx={{ mr: 1 }} />
                <Typography variant="body2">support@baraholka.ru</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'grey.400' }}>
                <LocationIcon sx={{ mr: 1 }} />
                <Typography variant="body2">Москва, ул. Пушкина, д. 1</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.800' }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="grey.400">
            © {new Date().getFullYear()} Барахолка. Все права защищены.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link
              component={RouterLink}
              to="/privacy"
              sx={{
                color: 'grey.400',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Конфиденциальность
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              sx={{
                color: 'grey.400',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Условия использования
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
