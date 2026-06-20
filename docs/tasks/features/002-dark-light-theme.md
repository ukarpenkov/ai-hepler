# Feature: Тёмная и светлая тема

**Дата:** 2026-06-21
**Приоритет:** Low
**Статус:** Open
**Компонент:** Frontend — UI/UX

---

## Описание

Приложение работает только в светлой теме. Нужно добавить переключатель тёмной/светлой темы с автоматическим определением системных предпочтений пользователя.

## Текущее поведение

- Только светлая тема
- Нет переключателя темы
- Приложение не учитывает `prefers-color-scheme` из ОС

## Ожидаемое поведение

### 1. Переключатель темы
- Кнопка/переключатель в хедере или сайдбаре
- Иконки: ☀️ (светлая) / 🌙 (тёмная) / 🔄 (авто)
- Позиция: верхний правый угол или рядом с логотипом

### 2. Автоопределение
- При первом запуске — следовать `prefers-color-scheme` из ОС
- Сохранять выбор пользователя в `localStorage`
- При повторном запуске — использовать сохранённую настройку

### 3. Плавное переключение
- Анимация перехода между темами (~200ms)
- Без мерцания (flash of unstyled content)

---

## Цветовые палитры

### Светлая тема (default)

| Элемент | Цвет |
|---------|------|
| Фон основной | `#ffffff` |
| Фон вторичный | `#f9fafb` |
| Текст основной | `#111827` |
| Текст вторичный | `#6b7280` |
| Акцентный | `#2563eb` |
| Граница | `#e5e7eb` |
| Успех | `#16a34a` |
| Ошибка | `#dc2626` |

### Тёмная тема

| Элемент | Цвет |
|---------|------|
| Фон основной | `#111827` |
| Фон вторичный | `#1f2937` |
| Текст основной | `#f9fafb` |
| Текст вторичный | `#9ca3af` |
| Акцентный | `#3b82f6` |
| Граница | `#374151` |
| Успех | `#22c55e` |
| Ошибка | `#ef4444` |

---

## Техническая реализация

### Вариант 1: Tailwind CSS (рекомендуется)

```tsx
// next.config.mjs
const config = {
  darkMode: 'class', // или 'media'
};
```

```tsx
// компонент переключателя
<button onClick={() => document.documentElement.classList.toggle('dark')}>
  🌙
</button>
```

```html
<!-- в layout -->
<html class="dark">
```

```css
/* tailwind.config.ts */
darkMode: 'class',
```

```tsx
// использование
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

### Вариант 2: CSS Custom Properties

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #111827;
}

.dark {
  --bg-primary: #111827;
  --text-primary: #f9fafb;
}
```

---

## Файлы для изменения

| Файл | Изменение |
|------|-----------|
| `tailwind.config.ts` | Добавить `darkMode: 'class'` |
| `packages/web/app/layout.tsx` | Добавить класс `dark` при загрузке |
| `packages/web/components/ThemeToggle.tsx` | **Новый** — компонент переключателя |
| `packages/web/components/Header.tsx` | Добавить ThemeToggle |
| `packages/web/components/ChatWindow.tsx` | Добавить dark: классы |
| `packages/web/components/MessageBubble.tsx` | Добавить dark: классы |
| `packages/web/components/FeedbackCard.tsx` | Добавить dark: классы |
| `packages/web/components/JobUpload.tsx` | Добавить dark: классы |
| `packages/web/app/page.tsx` | Добавить dark: классы |
| `packages/web/app/interview/page.tsx` | Добавить dark: классы |

---

## Компонент ThemeToggle

```tsx
"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (systemDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
```

---

## Acceptance Criteria

- [ ] Переключатель темы отображается в хедере
- [ ] Клик переключает тему
- [ ] Выбор сохраняется в localStorage
- [ ] При загрузке страницы применяется сохранённая тема
- [ ] Автоопределение системной темы при первом запуске
- [ ] Плавная анимация переключения
- [ ] Все компоненты корректно отображаются в обеих темах
- [ ] Нет "flash of unstyled content"
- [ ] Одинаковый UX в обеих темах

---

## Приоритеты

| Элемент | Приоритет |
|---------|-----------|
| ThemeToggle компонент | **High** |
| Tailwind dark mode конфиг | **High** |
| ChatWindow тема | **Medium** |
| Остальные компоненты | **Medium** |
| Анимация перехода | **Low** |
