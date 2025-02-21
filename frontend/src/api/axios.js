import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Функция для получения актуального токена
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('Токен не найден в localStorage');
    return null;
  }

  try {
    // Проверяем, можно ли декодировать base64 части токена
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Токен не соответствует формату JWT (должен содержать 3 части)');
      return null;
    }

    // Проверяем, не истек ли токен
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.warn('Токен истек');
      localStorage.removeItem('token');
      return null;
    }

    return token;
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return null;
  }
};

instance.interceptors.request.use(
  config => {
    console.log('Подготовка запроса:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
    });

    // Для multipart/form-data не устанавливаем Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Отправка запроса с токеном:', {
        url: config.url,
        method: config.method,
        tokenPrefix: token.substring(0, 10) + '...',
      });
    } else {
      console.log('Отправка запроса без токена:', {
        url: config.url,
        method: config.method,
      });
    }

    return config;
  },
  error => {
    console.error('Ошибка в интерцепторе запроса:', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  response => {
    console.log('Успешный ответ:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async error => {
    console.error('Ошибка в запросе:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
    });

    if (error.response?.status === 401) {
      console.log('Ошибка авторизации, очистка токена');
      localStorage.removeItem('token');

      // Проверяем, не находимся ли мы уже на странице логина
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
