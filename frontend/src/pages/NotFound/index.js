import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

function NotFound() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: '8rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196f3 30%, #f50057 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            404
          </Typography>

          <Typography variant="h4" gutterBottom>
            Страница не найдена
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            К сожалению, запрашиваемая страница не существует или была удалена. Возможно, вы перешли
            по устаревшей ссылке или неверно ввели адрес.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" size="large" onClick={() => navigate('/')}>
              На главную
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate(-1)}>
              Назад
            </Button>
          </Box>
        </MotionBox>
      </Box>
    </Container>
  );
}

export default NotFound;
