# Барахолка - Платформа объявлений

Барахолка - это современная платформа для размещения и поиска объявлений, разработанная с использованием Django и React.

## Содержание
- [Требования к системе](#требования-к-системе)
- [Установка необходимого ПО](#установка-необходимого-по)
- [Настройка проекта](#настройка-проекта)
- [Настройка базы данных](#настройка-базы-данных)
- [Загрузка начальных данных](#загрузка-начальных-данных)

## Требования к системе

- Python 3.11 или выше
- Node.js 18.x или выше
- PostgreSQL 14 или выше
- Git

## Установка необходимого ПО

### 1. Установка Python 3.11
1. Скачайте Python 3.11 с [официального сайта](https://www.python.org/downloads/)
2. Запустите установщик
3. ✅ Обязательно отметьте "Add Python to PATH"
4. Выберите "Install Now"
5. Проверьте установку:
```bash
python --version
```

### 2. Установка Node.js и npm
1. Скачайте Node.js с [официального сайта](https://nodejs.org/)
2. Запустите установщик
3. Следуйте инструкциям установщика
4. Проверьте установку:
```bash
node --version
npm --version
```

### 3. Установка PostgreSQL
1. Скачайте PostgreSQL с [официального сайта](https://www.postgresql.org/download/)
2. Запустите установщик
3. Выберите компоненты (оставьте все по умолчанию)
4. Задайте пароль для пользователя postgres
5. Стандартный порт: 5432
6. Проверьте установку через pgAdmin 4 (устанавливается вместе с PostgreSQL)

## Настройка проекта

### 1. Клонирование репозитория
```bash
git clone https://github.com/ChuChu19999/Baraholka.git
cd baraholka
```

### 2. Настройка Backend
```bash
cd backend
python -m venv venv
# Для Windows:
venv\Scripts\activate
# Для Linux/MacOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Настройка Frontend
```bash
cd frontend
npm install
```

## Настройка базы данных

1. Откройте pgAdmin 4
2. Создайте новую базу данных:
   - Правый клик на PostgreSQL
   - Create → Database
   - Имя базы данных: baraholka
   - Save

3. Настройка переменных окружения:
   - Скопируйте `.env.example` в `.env` в папке backend и папке frontend
   - Отредактируйте `.env`:

4. Применение миграций:
```bash
cd backend
python manage.py makemigrations
```

```bash
cd backend
python manage.py migrate
```

## Загрузка начальных данных

Для загрузки категорий выполните:
```bash
cd backend
python manage.py loaddata baraholka/fixtures/categories.json
```

## Основные функции

- Регистрация и аутентификация пользователей
- Создание и управление объявлениями
- Поиск и фильтрация объявлений
- Загрузка изображений
- Система категорий и подкатегорий
- Личный кабинет пользователя

## Технологии

### Backend
- Django 5.1.6
- Django REST Framework
- JWT аутентификация
- PostgreSQL
- Pillow для работы с изображениями

### Frontend
- React 18
- Material UI
- Redux Toolkit
- Axios
- React Router
- Formik & Yup
- Framer Motion

## Рекомендации по разработке

1. Используйте виртуальное окружение Python
2. Следуйте PEP 8 для Python кода
3. Используйте Prettier для форматирования JavaScript/React кода
4. Регулярно обновляйте зависимости
5. Следите за безопасностью приложения

## Решение проблем

### Проблемы с базой данных
1. Проверьте подключение к PostgreSQL
2. Убедитесь, что сервер PostgreSQL запущен
3. Проверьте правильность учетных данных в .env

### Проблемы с backend
1. Проверьте активацию виртуального окружения
2. Убедитесь, что все зависимости установлены
3. Проверьте логи в debug.log

### Проблемы с frontend
1. Очистите node_modules и package-lock.json
2. Выполните npm install заново
3. Проверьте консоль браузера на наличие ошибок 