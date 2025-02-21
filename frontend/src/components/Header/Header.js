import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  InputBase,
  Badge,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Favorite as FavoriteIcon,
  Chat as ChatIcon,
  Store as StoreIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { fetchChats } from '../../store/slices/chatSlice';
import axios from 'axios';
import debounce from 'lodash/debounce';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const pages = [
  { title: 'Главная', path: '/' },
  { title: 'Товары', path: '/products' },
];

const settings = [
  { title: 'Профиль', path: '/profile' },
  { title: 'Сообщения', path: '/chats' },
  { title: 'Выход', path: '/logout' },
];

// Добавляем функцию для генерации цвета на основе строки
const stringToColor = string => {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#2196F3', // синий
    '#4CAF50', // зеленый
    '#FF9800', // оранжевый
    '#E91E63', // розовый
    '#9C27B0', // фиолетовый
    '#00BCD4', // голубой
    '#009688', // бирюзовый
    '#F44336', // красный
  ];

  return colors[Math.abs(hash) % colors.length];
};

// Добавляем функцию для создания свойств аватара
const stringAvatar = name => {
  if (!name) return { children: '?' };

  const initial = name.charAt(0).toUpperCase();

  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 36,
      height: 36,
      fontSize: '1.1rem',
      fontWeight: 600,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    children: initial,
  };
};

function Header() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { chats } = useSelector(state => state.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Сохранение истории поиска
  const saveToHistory = query => {
    if (query.trim()) {
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  // Функция поиска с debounce
  const debouncedSearch = useCallback(
    debounce(async query => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`/api/products/?search=${encodeURIComponent(query)}`);
        setSearchResults(response.data.results.slice(0, 5));
      } catch (error) {
        console.error('Ошибка при поиске:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Обработчик изменения поискового запроса
  const handleSearchChange = event => {
    const query = event.target.value;
    setSearchQuery(query);
    setAnchorEl(event.currentTarget);
    debouncedSearch(query);
  };

  // Обработчик выбора результата поиска
  const handleSearchSelect = item => {
    if (typeof item === 'string') {
      // Если выбран элемент из истории
      setSearchQuery(item);
      navigate(`/products?search=${encodeURIComponent(item)}`);
    } else {
      // Если выбран товар из результатов поиска
      navigate(`/products/${item.slug}`);
    }
    saveToHistory(typeof item === 'string' ? item : item.title);
    setAnchorEl(null);
    setSearchResults([]);
  };

  // Обработчик отправки формы поиска
  const handleSearchSubmit = event => {
    event.preventDefault();
    if (searchQuery.trim()) {
      saveToHistory(searchQuery);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setAnchorEl(null);
      setSearchResults([]);
    }
  };

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = event => {
      if (anchorEl && !anchorEl.contains(event.target)) {
        setAnchorEl(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [anchorEl]);

  // Очистка результатов при смене страницы
  useEffect(() => {
    setSearchResults([]);
    setAnchorEl(null);
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchChats());
    }
  }, [dispatch, isAuthenticated]);

  const totalUnreadCount = chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);

  const handleOpenNavMenu = event => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = event => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleCloseUserMenu();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              mr: 3,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': {
                '& .logo-icon': {
                  transform: 'scale(1.1) rotate(-5deg)',
                },
                '& .logo-text': {
                  color: 'rgba(255, 255, 255, 0.95)',
                },
              },
            }}
          >
            <StoreIcon
              className="logo-icon"
              sx={{
                fontSize: '2rem',
                color: '#fff',
                mr: 1,
                transition: 'transform 0.3s ease-in-out',
              }}
            />
            <Typography
              variant="h6"
              noWrap
              className="logo-text"
              sx={{
                fontWeight: 700,
                fontSize: '1.4rem',
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '0.02em',
                fontFamily: '"Roboto Condensed", sans-serif',
                transition: 'color 0.3s ease-in-out',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                '& span': {
                  color: theme => theme.palette.secondary.main,
                  fontWeight: 800,
                },
              }}
            >
              Бара<span>Х</span>олка
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  mt: 1.5,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              }}
            >
              {pages.map(page => (
                <MenuItem
                  key={page.title}
                  onClick={handleCloseNavMenu}
                  component={RouterLink}
                  to={page.path}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <Typography textAlign="center" sx={{ fontWeight: 500 }}>
                    {page.title}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <StoreIcon
              sx={{
                fontSize: '1.8rem',
                color: '#fff',
                mr: 1,
              }}
            />
            <Typography
              variant="h5"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '0.02em',
                fontFamily: '"Roboto Condensed", sans-serif',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                '& span': {
                  color: theme => theme.palette.secondary.main,
                  fontWeight: 800,
                },
              }}
            >
              Бара<span>Х</span>олка
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map(page => (
              <Button
                key={page.title}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{
                  mx: 1,
                  my: 2,
                  color: 'white',
                  display: 'block',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: '2px',
                    bgcolor: 'white',
                    transition: 'width 0.2s ease-in-out',
                  },
                  '&:hover': {
                    bgcolor: 'transparent',
                    '&::after': {
                      width: '70%',
                    },
                  },
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          <Search>
            <SearchIconWrapper>
              <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </SearchIconWrapper>
            <form onSubmit={handleSearchSubmit}>
              <StyledInputBase
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={handleSearchChange}
                inputProps={{ 'aria-label': 'search' }}
                sx={{
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      opacity: 1,
                    },
                  },
                }}
              />
            </form>
            <Popper
              open={
                Boolean(anchorEl) &&
                (searchResults.length > 0 || searchHistory.length > 0 || isLoading)
              }
              anchorEl={anchorEl}
              placement="bottom-start"
              sx={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
            >
              <Paper
                elevation={3}
                sx={{
                  mt: 1,
                  maxHeight: '400px',
                  overflow: 'auto',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 1,
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {searchResults.length > 0 && (
                      <>
                        <ListItem
                          sx={{ py: 0.5, px: 2, typography: 'subtitle2', color: 'text.secondary' }}
                        >
                          <TrendingUpIcon fontSize="small" sx={{ mr: 1 }} />
                          Результаты поиска
                        </ListItem>
                        {searchResults.map(item => (
                          <ListItem
                            key={item.id}
                            button
                            onClick={() => handleSearchSelect(item)}
                            sx={{
                              py: 1,
                              px: 2,
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <ListItemText
                              primary={item.title}
                              secondary={`${item.price} ₽`}
                              primaryTypographyProps={{
                                variant: 'body2',
                                noWrap: true,
                              }}
                            />
                          </ListItem>
                        ))}
                        <Divider />
                      </>
                    )}
                    {searchHistory.length > 0 && !searchResults.length && (
                      <>
                        <ListItem
                          sx={{ py: 0.5, px: 2, typography: 'subtitle2', color: 'text.secondary' }}
                        >
                          <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
                          История поиска
                        </ListItem>
                        {searchHistory.map((query, index) => (
                          <ListItem
                            key={index}
                            button
                            onClick={() => handleSearchSelect(query)}
                            sx={{
                              py: 1,
                              px: 2,
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <ListItemText
                              primary={query}
                              primaryTypographyProps={{
                                variant: 'body2',
                                noWrap: true,
                              }}
                            />
                          </ListItem>
                        ))}
                      </>
                    )}
                  </List>
                )}
              </Paper>
            </Popper>
          </Search>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/add-product"
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  sx={{
                    mr: 2,
                    display: { xs: 'none', md: 'flex' },
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Разместить объявление
                </Button>

                <IconButton
                  component={RouterLink}
                  to="/favorites"
                  sx={{
                    mr: 2,
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 20 }} />
                </IconButton>

                <IconButton
                  component={RouterLink}
                  to="/chats"
                  sx={{
                    mr: 2,
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Badge
                    badgeContent={totalUnreadCount}
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#ff4444',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <ChatIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>

                <Tooltip title="Открыть меню">
                  <IconButton
                    onClick={handleOpenUserMenu}
                    sx={{
                      p: 0,
                      width: 40,
                      height: 40,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      '&:hover': {
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Avatar
                      {...stringAvatar(user?.username || '')}
                      alt={user?.username || 'Пользователь'}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map(setting => (
                    <MenuItem
                      key={setting.title}
                      component={setting.path === '/logout' ? 'button' : RouterLink}
                      to={setting.path !== '/logout' ? setting.path : undefined}
                      onClick={() => {
                        if (setting.path === '/logout') {
                          handleLogout();
                        } else {
                          handleCloseUserMenu();
                        }
                      }}
                    >
                      <Typography textAlign="center">{setting.title}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Button component={RouterLink} to="/login" variant="contained" color="secondary">
                Войти
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
