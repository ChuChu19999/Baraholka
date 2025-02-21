import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { registerAsync, clearError } from '../../store/slices/authSlice';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const steps = ['Основная информация', 'Контактные данные', 'Подтверждение'];

const formatPhoneNumber = value => {
  // Удаляем все нецифровые символы
  const phoneNumber = value.replace(/\D/g, '');

  // Ограничиваем длину до 11 цифр
  const truncated = phoneNumber.slice(0, 11);

  // Форматируем номер
  if (truncated.length === 0) return '';
  if (truncated.length <= 1) return `+${truncated}`;
  if (truncated.length <= 4) return `+${truncated.slice(0, 1)} (${truncated.slice(1)}`;
  if (truncated.length <= 7)
    return `+${truncated.slice(0, 1)} (${truncated.slice(1, 4)}) ${truncated.slice(4)}`;
  if (truncated.length <= 9)
    return `+${truncated.slice(0, 1)} (${truncated.slice(1, 4)}) ${truncated.slice(4, 7)}-${truncated.slice(7)}`;
  return `+${truncated.slice(0, 1)} (${truncated.slice(1, 4)}) ${truncated.slice(4, 7)}-${truncated.slice(7, 9)}-${truncated.slice(9)}`;
};

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone_number: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      // Удаляем все нецифровые символы из введенного значения
      const digitsOnly = value.replace(/\D/g, '');

      // Ограничиваем ввод только 11 цифрами
      if (digitsOnly.length <= 11) {
        // Форматируем номер телефона
        let formattedPhone = '';
        if (digitsOnly.length > 0) {
          // Если первая цифра не 7, добавляем её автоматически
          const phoneNumber = digitsOnly.startsWith('7') ? digitsOnly : '7' + digitsOnly;
          formattedPhone = formatPhoneNumber(phoneNumber);
        }

        setFormData(prev => ({
          ...prev,
          [name]: formattedPhone,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    setValidationError('');
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (
          !formData.username ||
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword
        ) {
          setValidationError('Пожалуйста, заполните все поля');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setValidationError('Пароли не совпадают');
          return false;
        }
        if (formData.password.length < 8) {
          setValidationError('Пароль должен содержать минимум 8 символов');
          return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
          setValidationError(
            'Имя пользователя может содержать только буквы, цифры и знак подчеркивания'
          );
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setValidationError('Введите корректный email адрес');
          return false;
        }
        break;
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.phone_number) {
          setValidationError('Пожалуйста, заполните все обязательные поля');
          return false;
        }
        if (formData.phone_number.length < 18) {
          // +7 (XXX) XXX-XX-XX
          setValidationError('Введите корректный номер телефона');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setValidationError('');
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateStep()) return;

    const registrationData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.confirmPassword,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phone_number,
    };

    try {
      await dispatch(registerAsync(registrationData)).unwrap();
      navigate('/profile');
    } catch (err) {
      // Ошибка уже обработана в slice
    }
  };

  const renderStepContent = step => {
    switch (step) {
      case 0:
        return (
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TextField
              fullWidth
              label="Имя пользователя"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              sx={{
                '& .MuiInputBase-root': {
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                '& .MuiInputBase-root': {
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Пароль"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Подтверждение пароля"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                },
              }}
            />
          </MotionBox>
        );
      case 1:
        return (
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TextField
              fullWidth
              label="Имя"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                '& .MuiInputBase-root': {
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Фамилия"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
              required
              sx={{
                '& .MuiInputBase-root': {
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Номер телефона"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              margin="normal"
              required
              placeholder="+7 (___) ___-__-__"
              inputProps={{
                maxLength: 18,
              }}
              helperText="Формат: +7 (XXX) XXX-XX-XX"
              sx={{
                '& .MuiInputBase-root': {
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                },
              }}
            />
          </MotionBox>
        );
      case 2:
        return (
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Typography variant="h6" gutterBottom>
              Проверьте введенные данные
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Имя пользователя:</Typography>
              <Typography color="text.secondary">{formData.username}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Email:</Typography>
              <Typography color="text.secondary">{formData.email}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Имя:</Typography>
              <Typography color="text.secondary">{formData.firstName}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Фамилия:</Typography>
              <Typography color="text.secondary">{formData.lastName}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Телефон:</Typography>
              <Typography color="text.secondary">{formData.phone_number}</Typography>
            </Box>
          </MotionBox>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <MotionPaper
        elevation={3}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ p: 4, borderRadius: 2 }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Регистрация
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {(validationError || error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError || error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">{renderStepContent(activeStep)}</AnimatePresence>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              startIcon={<ArrowBackIcon />}
              sx={{
                '&:not(:disabled):hover': {
                  transform: 'translateX(-4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Назад
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  minWidth: 120,
                  '&:not(:disabled):hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'primary.light' }} />
                ) : (
                  'Зарегистрироваться'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                disabled={loading}
                sx={{
                  '&:hover': {
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Далее
              </Button>
            )}
          </Box>
        </form>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            sx={{
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Уже есть аккаунт? Войдите
          </Link>
        </Box>
      </MotionPaper>
    </Container>
  );
}

export default RegisterPage;
