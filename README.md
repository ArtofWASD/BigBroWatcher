# Таблица заказов с TanStack Table

Веб-приложение для отображения и управления заказами с использованием TanStack Table и Supabase.

## Возможности

- ✅ Сортировка по всем колонкам
- ✅ Кастомная сортировка времени обработки
- ✅ Пагинация с настраиваемым количеством строк
- ✅ Условное выделение строк по времени обработки
- ✅ Подключение к базе данных Supabase
- ✅ Обработка загрузки и ошибок

## Установка и настройка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com)
2. Создайте таблицу `orders` со следующей структурой:

```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_time VARCHAR NOT NULL,
  department VARCHAR NOT NULL
);
```

3. Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Замените `your_supabase_url_here` и `your_supabase_anon_key_here` на ваши реальные данные из Supabase Dashboard.

### 3. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000).

## Структура проекта

```
├── app/
│   └── page.tsx              # Основной компонент таблицы
├── hooks/
│   └── useOrders.ts          # Хук для работы с данными
├── lib/
│   └── supabase.ts           # Конфигурация Supabase
├── types/
│   └── database.ts           # Типы данных
└── README.md
```

## Использование

### Сортировка
- Кликните на заголовки колонок для сортировки
- Поддерживается сортировка по времени обработки с кастомной логикой

### Пагинация
- Используйте кнопки навигации внизу таблицы
- Измените количество строк на странице через выпадающий список

### Выделение строк
- Включите переключатель "Выделение по времени" в правом верхнем углу
- Строки с временем обработки 20-30 минут выделяются желтым
- Строки с временем обработки более 30 минут выделяются красным

## Технологии

- **Next.js 14** - React фреймворк
- **TanStack Table** - библиотека для таблиц
- **Supabase** - база данных и бэкенд
- **Tailwind CSS** - стилизация
- **TypeScript** - типизация

## Разработка

### Добавление новых колонок

1. Обновите тип `Order` в `types/database.ts`
2. Добавьте новую колонку в массив `columns` в `app/page.tsx`
3. Обновите структуру таблицы в Supabase

### Кастомизация стилей

Все стили используют Tailwind CSS. Основные классы:
- `bg-yellow-50` - желтое выделение
- `bg-red-50` - красное выделение
- `hover:bg-gray-50` - hover эффект

## Лицензия

MIT
