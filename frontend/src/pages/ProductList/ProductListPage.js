import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Chip,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Skeleton,
  Slider,
  Paper,
  InputAdornment,
  Alert,
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  Sort as SortIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import useDebounce from '../../hooks/useDebounce';
import { fetchProducts, toggleFavorite } from '../../store/slices/productsSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { formatDate } from '../../utils/dateUtils';

const MotionCard = motion(Card);
const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  hover: {
    y: -8,
    boxShadow: '0px 8px 16px rgba(0,0,0,0.1)',
    transition: { duration: 0.2 },
  },
};

const sortOptions = [
  { value: '-created_at', label: 'Сначала новые' },
  { value: 'price', label: 'Сначала дешевле' },
  { value: '-price', label: 'Сначала дороже' },
  { value: '-views_count', label: 'По популярности' },
];

const conditions = [
  { value: 'new', label: 'Новый' },
  { value: 'used', label: 'Б/У' },
];

const ProductSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <Skeleton variant="rectangular" height={200} animation="wave" />
    <CardContent>
      <Skeleton variant="text" height={32} animation="wave" />
      <Skeleton variant="text" width="60%" animation="wave" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Skeleton variant="text" width="40%" animation="wave" />
        <Skeleton variant="circular" width={32} height={32} animation="wave" />
      </Box>
    </CardContent>
  </Card>
);

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
      borderRadius: 1,
      color: 'text.secondary',
    }}
  >
    <ImageIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
    <Typography variant="body2" sx={{ opacity: 0.7 }}>
      Нет фото
    </Typography>
  </Box>
);

function ProductListPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: products, loading, error, totalPages } = useSelector(state => state.products);
  const { items: categories = [] } = useSelector(state => state.categories);

  // Функция для получения структурированных категорий
  const getStructuredCategories = useMemo(() => {
    const parentCategories = categories.filter(category => !category.parent);
    return parentCategories.map(parent => ({
      ...parent,
      children: categories.filter(child => child.parent === parent.id),
    }));
  }, [categories]);

  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    return {
      category: params.get('category') || '',
      condition: params.get('condition') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      search: params.get('search') || '',
      sort: params.get('sort') || '-created_at',
      status: 'active',
    };
  });

  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(location.search);
    return parseInt(params.get('page')) || 1;
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favoriteError, setFavoriteError] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    if (page > 1) params.append('page', page);
    navigate({ search: params.toString() }, { replace: true });

    dispatch(
      fetchProducts({
        ...filters,
        page,
        status: 'active',
      })
    );
  }, [dispatch, filters, page, debouncedSearch]);

  const handleFilterChange = event => {
    const { name, value } = event.target;

    if (name === 'category') {
      if (typeof value === 'string' && value.includes(':')) {
        // Если выбрана подкатегория (формат "parentId:childId")
        const [parentId, childId] = value.split(':');
        setFilters(prev => ({
          ...prev,
          category: parentId,
          subcategory: childId,
        }));
      } else {
        // Если выбрана основная категория
        setFilters(prev => ({
          ...prev,
          category: value,
          subcategory: '', // Сбрасываем подкатегорию
        }));
      }
    } else {
      // Для остальных фильтров
      setFilters(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: '-created_at',
      status: 'active',
    });
    setPage(1);
  };

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length - 1; // Исключаем sort
  }, [filters]);

  const handleToggleFavorite = async (e, slug) => {
    e.stopPropagation();
    try {
      await dispatch(toggleFavorite(slug)).unwrap();
    } catch (error) {
      if (!localStorage.getItem('token')) {
        navigate('/login');
      } else {
        // Показываем сообщение об ошибке
        setFavoriteError(
          error.response?.data?.error || 'Произошла ошибка при добавлении в избранное'
        );
        // Автоматически скрываем сообщение через 3 секунды
        setTimeout(() => setFavoriteError(null), 3000);
      }
    }
  };

  const filterContent = (
    <Box sx={{ p: 2, width: isMobile ? 'auto' : 250 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Фильтры
          {activeFiltersCount > 0 && (
            <Chip size="small" label={activeFiltersCount} color="primary" sx={{ ml: 1 }} />
          )}
        </Typography>
        {activeFiltersCount > 0 && (
          <Button size="small" startIcon={<ClearIcon />} onClick={handleClearFilters}>
            Сбросить
          </Button>
        )}
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Сортировка</InputLabel>
        <Select
          value={filters.sort}
          label="Сортировка"
          name="sort"
          onChange={handleFilterChange}
          startAdornment={
            <InputAdornment position="start">
              <SortIcon />
            </InputAdornment>
          }
        >
          {sortOptions.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Категория</InputLabel>
        <Select
          value={filters.category}
          label="Категория"
          name="category"
          onChange={handleFilterChange}
        >
          <MenuItem value="">Все категории</MenuItem>
          {getStructuredCategories.map(parentCategory => [
            <MenuItem key={parentCategory.id} value={parentCategory.id} sx={{ fontWeight: 'bold' }}>
              {parentCategory.name}
            </MenuItem>,
            ...parentCategory.children.map(childCategory => (
              <MenuItem
                key={childCategory.id}
                value={`${parentCategory.id}:${childCategory.id}`}
                sx={{ pl: 4 }}
              >
                {childCategory.name}
              </MenuItem>
            )),
          ])}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Состояние</InputLabel>
        <Select
          value={filters.condition}
          label="Состояние"
          name="condition"
          onChange={handleFilterChange}
        >
          <MenuItem value="">Любое</MenuItem>
          {conditions.map(condition => (
            <MenuItem key={condition.value} value={condition.value}>
              {condition.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography gutterBottom>Цена</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            size="small"
            label="От"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">₽</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            size="small"
            label="До"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">₽</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  if (favoriteError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => dispatch(fetchProducts({ ...filters, page }))}
            >
              Повторить
            </Button>
          }
        >
          {favoriteError}
        </Alert>
      </Container>
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
      {favoriteError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFavoriteError(null)}>
          {favoriteError}
        </Alert>
      )}
      <Grid container spacing={3}>
        {/* Фильтры для десктопа */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <MotionPaper
              elevation={3}
              sx={{ p: 2, position: 'sticky', top: 16 }}
              variants={cardVariants}
            >
              {filterContent}
            </MotionPaper>
          </Grid>
        )}

        {/* Список товаров */}
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <TextField
                  fullWidth
                  label="Поиск товаров"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: filters.search && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {isMobile && (
                <Grid item>
                  <Tooltip title="Фильтры" TransitionComponent={Zoom}>
                    <Button
                      variant="outlined"
                      onClick={toggleDrawer(true)}
                      startIcon={<FilterListIcon />}
                    >
                      Фильтры
                      {activeFiltersCount > 0 && (
                        <Chip
                          size="small"
                          label={activeFiltersCount}
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Button>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Активные фильтры */}
          {activeFiltersCount > 0 && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(filters.category || filters.subcategory) &&
                Array.isArray(categories) &&
                categories.length > 0 && (
                  <Chip
                    label={`Категория: ${
                      filters.subcategory
                        ? `${categories.find(c => c.id.toString() === filters.category.toString())?.name} > ${
                            categories.find(c => c.id.toString() === filters.subcategory.toString())
                              ?.name
                          }`
                        : categories.find(c => c.id.toString() === filters.category.toString())
                            ?.name
                    }`}
                    onDelete={() =>
                      setFilters(prev => ({ ...prev, category: '', subcategory: '' }))
                    }
                  />
                )}
              {filters.condition && (
                <Chip
                  label={`Состояние: ${conditions.find(c => c.value === filters.condition)?.label}`}
                  onDelete={() => setFilters(prev => ({ ...prev, condition: '' }))}
                />
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Chip
                  label={`Цена: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'} ₽`}
                  onDelete={() => setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }))}
                />
              )}
            </Box>
          )}

          <Grid container spacing={3}>
            <AnimatePresence mode="popLayout">
              {loading ? (
                // Скелетоны при загрузке
                Array.from({ length: 12 }).map((_, index) => (
                  <Grid item key={`skeleton-${index}`} xs={12} sm={6} md={4}>
                    <ProductSkeleton />
                  </Grid>
                ))
              ) : products.length === 0 ? (
                // Сообщение, если товары не найдены
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      Товары не найдены
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      Попробуйте изменить параметры поиска
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleClearFilters}
                      startIcon={<ClearIcon />}
                    >
                      Сбросить фильтры
                    </Button>
                  </Box>
                </Grid>
              ) : (
                // Список товаров
                products.map(product => (
                  <Grid item key={product.id} xs={12} sm={6} md={4}>
                    <MotionCard
                      variants={cardVariants}
                      whileHover="hover"
                      layoutId={`product-${product.id}`}
                      onClick={() => navigate(`/products/${product.slug}`)}
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                        {product.main_image ? (
                          <CardMedia
                            component="img"
                            image={product.main_image}
                            alt={product.title}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease-in-out',
                              '&:hover': {
                                transform: 'scale(1.05)',
                              },
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                            }}
                          >
                            <ImagePlaceholder title={product.title} />
                          </Box>
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {product.title}
                        </Typography>
                        <Typography
                          variant="h5"
                          color="primary"
                          gutterBottom
                          sx={{ fontWeight: 'bold' }}
                        >
                          {Number(product.price).toLocaleString('ru-RU')} ₽
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          <Chip
                            size="small"
                            label={product.condition === 'new' ? 'Новый' : 'Б/У'}
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            size="small"
                            icon={<LocationIcon />}
                            label={product.location}
                            variant="outlined"
                          />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 'auto',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(product.created_at)}
                          </Typography>
                          <Tooltip
                            title={
                              product.is_favorite ? 'Удалить из избранного' : 'Добавить в избранное'
                            }
                            TransitionComponent={Zoom}
                          >
                            <IconButton
                              onClick={e => handleToggleFavorite(e, product.slug)}
                              color={product.is_favorite ? 'error' : 'default'}
                              sx={{
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s',
                              }}
                            >
                              {product.is_favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </MotionCard>
                  </Grid>
                ))
              )}
            </AnimatePresence>
          </Grid>

          {/* Пагинация */}
          {!loading && products.length > 0 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              />
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Drawer для мобильных фильтров */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 360,
          },
        }}
      >
        {filterContent}
      </Drawer>
    </MotionContainer>
  );
}

export default ProductListPage;
