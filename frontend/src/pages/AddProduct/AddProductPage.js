import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import { Delete as DeleteIcon, PhotoCamera } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { createProduct } from '../../store/slices/productsSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';

const TextFieldAdapter = ({ field, form: { touched, errors }, ...props }) => (
  <TextField
    {...field}
    {...props}
    error={touched[field.name] && Boolean(errors[field.name])}
    helperText={touched[field.name] && errors[field.name]}
  />
);

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
  title: yup.string().required('Введите название товара').min(3, 'Минимум 3 символа'),
  description: yup.string().required('Введите описание товара').min(10, 'Минимум 10 символов'),
  price: yup.number().required('Введите цену').positive('Цена должна быть положительной'),
  category: yup.number().required('Выберите категорию'),
  subcategory: yup.number().required('Выберите подкатегорию'),
  condition: yup.string().required('Выберите состояние товара'),
  location: yup.string().required('Введите местоположение'),
});

const conditions = [
  { value: 'new', label: 'Новый' },
  { value: 'used', label: 'Б/У' },
];

function AddProductPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items: categories = [],
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector(state => state.categories);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Обновляем логирование
  useEffect(() => {
    console.log('Все категории:', categories);
    const mainCategories = categories.filter(category => !category.parent);
    const subCategories = categories.filter(category => category.parent);
    console.log('Основные категории:', mainCategories);
    console.log('Подкатегории:', subCategories);
    console.log('Загрузка категорий:', categoriesLoading);
    console.log('Ошибка загрузки:', categoriesError);
  }, [categories, categoriesLoading, categoriesError]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      const formData = new FormData();

      // Преобразуем цену в строку с двумя знаками после запятой
      const formattedPrice = Number(values.price).toFixed(2);

      // Добавляем основные поля
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('price', formattedPrice);
      formData.append('category', values.category);
      formData.append('subcategory', values.subcategory);
      formData.append('condition', values.condition);
      formData.append('location', values.location);
      formData.append('status', 'active');

      // Добавляем изображения
      if (uploadedImages.length > 0) {
        uploadedImages.forEach((image, index) => {
          formData.append(`uploaded_images[${index}]`, image);
        });
      }

      const response = await dispatch(createProduct(formData)).unwrap();
      navigate('/profile');
    } catch (err) {
      console.error('Ошибка при создании товара:', err);
      if (err.response) {
        setError(
          Object.values(err.response.data).flat().join(', ') ||
            'Произошла ошибка при создании объявления'
        );
      } else {
        setError('Произошла ошибка при создании объявления');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = event => {
    const files = Array.from(event.target.files);
    setUploadedImages(prev => [...prev, ...files]);
  };

  const removeImage = index => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <MotionPaper
        elevation={3}
        sx={{ p: 4 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Разместить объявление
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {categoriesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {categoriesError}
          </Alert>
        )}

        <Formik
          initialValues={{
            title: '',
            description: '',
            price: '',
            category: '',
            subcategory: '',
            condition: '',
            location: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Field
                    component={TextFieldAdapter}
                    name="title"
                    label="Название товара"
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    component={TextFieldAdapter}
                    name="description"
                    label="Описание товара"
                    multiline
                    rows={4}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    component={TextFieldAdapter}
                    name="price"
                    label="Цена"
                    type="number"
                    fullWidth
                    required
                    InputProps={{
                      endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    component={TextFieldAdapter}
                    name="category"
                    label="Основная категория"
                    select
                    fullWidth
                    required
                    disabled={categoriesLoading}
                    onChange={e => {
                      const categoryId = e.target.value;
                      setFieldValue('category', categoryId);
                      setFieldValue('subcategory', ''); // Сбрасываем подкатегорию
                    }}
                  >
                    <MenuItem value="">Выберите категорию</MenuItem>
                    {categories
                      .filter(category => !category.parent)
                      .map(category => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                  </Field>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    component={TextFieldAdapter}
                    name="subcategory"
                    label="Подкатегория"
                    select
                    fullWidth
                    required
                    disabled={!values.category}
                  >
                    <MenuItem value="">Выберите подкатегорию</MenuItem>
                    {categories
                      .filter(category => category.parent === Number(values.category))
                      .map(subcategory => (
                        <MenuItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </MenuItem>
                      ))}
                  </Field>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    component={TextFieldAdapter}
                    name="condition"
                    label="Состояние"
                    select
                    fullWidth
                    required
                  >
                    <MenuItem value="new">Новый</MenuItem>
                    <MenuItem value="used">Б/У</MenuItem>
                  </Field>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    component={TextFieldAdapter}
                    name="location"
                    label="Местоположение"
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="image-upload"
                      type="file"
                      multiple
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="image-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCamera />}
                        fullWidth
                      >
                        Загрузить фотографии
                      </Button>
                    </label>
                  </Box>

                  <ImageList sx={{ maxHeight: 200 }} cols={4} rowHeight={100}>
                    {uploadedImages.map((image, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Изображение ${index + 1}`}
                          loading="lazy"
                          style={{ height: '100%', objectFit: 'cover' }}
                        />
                        <ImageListItemBar
                          actionIcon={
                            <IconButton sx={{ color: 'white' }} onClick={() => removeImage(index)}>
                              <DeleteIcon />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  >
                    {isSubmitting ? 'Публикация...' : 'Опубликовать'}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </MotionPaper>
    </Container>
  );
}

export default AddProductPage;
