# Prompted: Redesign главной страницы

**Фича:** 003-redesign-main-page


---

## Общие правила (для каждого шага)

1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
1.1. **Прототип:** `C:\JS\ai-helper\ai-interview-simulator\docs\design\main-page.html`
**Статус:** В процессе
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

## Шаги

### Шаг 1: Обновить Tailwind конфиг — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Добавь в `packages/web/tailwind.config.ts` кастомные цвета, анимации и ключевые кадры из прототипа `docs/design/main-page.html`.

```
Обнови файл packages/web/tailwind.config.ts.

Добавь в theme.extend:
- colors: primary (#6366f1, hover #4f46e5, dark #818cf8), surface (bg, card, secondary через CSS-переменные), content (primary, secondary через CSS-переменные)
- borderRadius: glass 24px, card 16px, button 16px
- backdropBlur: glass 30px
- boxShadow: glass и button
- animation: slide-up, float
- keyframes: slideUp, float

Сохрани существующие настройки content и plugins.
```

**Тест:** `npm run typecheck` в `packages/web`

---

### Шаг 2: Обновить globals.css — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Добавь CSS-переменные для дизайн-системы в `packages/web/app/globals.css`. Переменные берутся из прототипа `docs/design/main-page.html`.

```
Обнови файл packages/web/app/globals.css.

Добавь после @tailwind директив:
- :root с переменными для светлой темы (bg-primary, bg-secondary, text-primary, text-secondary, accent, accent-hover, border, shadow, glass-bg)
- [data-theme="dark"] с переменными для тёмной темы
- body стили (font-family, background, color, transition)
- .glass utility класс (background, backdrop-filter, border)

Значения переменных бери из прототипа docs/design/main-page.html.
```

**Тест:** `npm run typecheck` в `packages/web`

---

### Шаг 3: Создать компонент ThemeToggle — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Создай компонент `packages/web/components/ThemeToggle.tsx` для переключения тёмной/светлой темы.

```
Создай новый файл packages/web/components/ThemeToggle.tsx.

Компонент:
- "use client" директива
- useState для theme ("light" | "dark")
- useEffect: загрузка из localStorage, проверка prefers-color-scheme, установка data-theme на documentElement
- toggle функция: переключение theme, сохранение в localStorage, обновление data-theme
- JSX: button с aria-label "Toggle theme", позиционированный dot (кружок), иконки ☀️/🌙
- Стили из прототипа: w-[60px] h-8 rounded-2xl, glass, border, transition

Создай тест packages/web/components/__tests__/ThemeToggle.test.tsx:
- Рендерится без ошибок
- Клик переключает тему
- Сохраняет в localStorage
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 4: Создать компонент BurgerMenu — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Создай компонент `packages/web/components/BurgerMenu.tsx` для toggle sidebar.

```
Создай новый файл packages/web/components/BurgerMenu.tsx.

Компонент:
- "use client" директива
- Пропсы: isOpen (boolean), onClick (() => void)
- JSX: button с тремя span полосками
- Анимация: когда isOpen=true, полоски превращаются в крестик (rotate 45/-45, opacity 0 для средней)
- Стили из прототипа: w-10 h-10, glass, border, gap-1.5, hover:bg-primary hover:scale-105

Создай тест packages/web/components/__tests__/BurgerMenu.test.tsx:
- Рендерится без ошибок
- Вызывает onClick при клике
- Применяет active классы когда isOpen=true
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 5: Создать компонент Header — 

**Статус:**

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Создай компонент `packages/web/components/Header.tsx` с логотипом, ThemeToggle и BurgerMenu.

```
Создай новый файл packages/web/components/Header.tsx.

Компонент:
- "use client" директива
- Пропсы: isSidebarOpen (boolean), onMenuToggle (() => void)
- JSX: fixed header (top-0, left-0, right-0, z-50)
  - Левая часть: логотип (градиентный бокс 36x36 с текстом "AI" + span "AI Interview")
  - Правая часть: ThemeToggle + BurgerMenu
- Стили из прототипа: glass, border-b, px-6 py-4, flex justify-between

Создай тест packages/web/components/__tests__/Header.test.tsx:
- Рендерится без ошибок
- Отображает логотип и текст
- Содержит ThemeToggle и BurgerMenu
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 6: Создать компонент Sidebar — 

**Статус:**

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Создай компонент `packages/web/components/Sidebar.tsx` для отображения истории сессий.

```
Создай новый файл packages/web/components/Sidebar.tsx.

Компонент:
- "use client" директива
- Интерфейс Session { id: string, title: string, date: string }
- Пропсы: isOpen (boolean), sessions (Session[])
- JSX: aside (fixed, top-0, left-0, w-80, h-screen)
  - Заголовок "История сессий"
  - Список сессий с hover-эффектами
- Виден по умолчанию: isOpen=true → left-0, isOpen=false → -left-80
- Стили из прототипа: glass, border-r, z-[99], pt-[100px], transition-all

Создай тест packages/web/components/__tests__/Sidebar.test.tsx:
- Рендерится без ошибок
- Отображает список сессий
- Применяет классы в зависимости от isOpen
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 7: Создать компонент JobInputForm — 

**Статус:**

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Создай компонент `packages/web/components/JobInputForm.tsx` с textarea и кнопкой.

```
Создай новый файл packages/web/components/JobInputForm.tsx.

Компонент:
- "use client" директива
- Пропсы: onSubmit ((jobText: string) => void), isLoading (boolean)
- Состояние: jobText (string)
- JSX:
  - Заголовок h1 "AI Interview Simulator" с градиентом
  - Textarea с placeholder "Вставьте текст вакансии..."
  - Кнопка "Начать интервью" с градиентом
- Стили из прототипа: animate-slide-up, gradient text, glass textarea, gradient button

Создай тест packages/web/components/__tests__/JobInputForm.test.tsx:
- Рендерится без ошибок
- Отображает заголовок и textarea
- Вызывает onSubmit с текстом при клике на кнопку
- Отображает loading состояние
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 8: Создать компонент BackgroundEffects — 

**Статус:**

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Создай компонент `packages/web/components/BackgroundEffects.tsx` для декоративных фоновых элементов.

```
Создай новый файл packages/web/components/BackgroundEffects.tsx.

Компонент:
- "use client" директива не нужна (нет хуков)
- JSX: два декоративных div с radial-gradient
  - Первый: акцентный цвет, top-right, opacity-15, animate-float
  - Второй: pink цвет, bottom-left, opacity-10, reverse animation
- Стили из прототипа: fixed, rounded-full, pointer-events-none

Создай тест packages/web/components/__tests__/BackgroundEffects.test.tsx:
- Рендерится без ошибок
- Содержит два декоративных элемента
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 9: Обновить layout.tsx — 

**Статус:**

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Обнови `packages/web/app/layout.tsx` для поддержки data-theme атрибута.

```
Обнови файл packages/web/app/layout.tsx.

Добавь:
- Script для загрузки темы из localStorage до рендера (чтобы не было FOUC)
- data-theme атрибут на html тег (через dangerouslySetInnerHTML или script)

Импортируй globals.css если ещё не импортирован.
```

**Тест:** `npm run typecheck` в `packages/web`

---

### Шаг 10: Переписать page.tsx — 

**Статус:**

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Перепиши `packages/web/app/page.tsx` для нового дизайна главной страницы.

```
Перепиши файл packages/web/app/page.tsx.

Новый код:
- "use client" директива
- Импорты: Header, Sidebar, JobInputForm, BackgroundEffects
- Состояние: isSidebarOpen (true по умолчанию), sessions (Session[])
- useEffect: загрузка сессий из API (fetch /api/sessions)
- handleStartInterview: вызов parseJob + startInterview, редирект на /interview
- JSX layout:
  - BackgroundEffects
  - Header (isSidebarOpen, onMenuToggle)
  - Sidebar (isOpen, sessions)
  - Main с transition margin-left (ml-80 при открытом sidebar)
  - JobInputForm внутри main

Сохрани существующую логику с API вызовами.
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 11: Обновить тест page.tsx — 

**Статус:**

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Обнови тест `packages/web/app/__tests__/page.test.tsx` для нового дизайна.

```
Обнови файл packages/web/app/__tests__/page.test.tsx.

Обнови моки:
- Добавь моки для Header, Sidebar, JobInputForm, BackgroundEffects

Обнови тесты:
- Рендерится без ошибок
- Содержит Header
- Содержит Sidebar
- Содержит JobInputForm
- Содержит BackgroundEffects
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 12: Запуск typecheck и lint — 

**Статус:**

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Запусти проверку типов и линтер для всего проекта.

```
Запусти в packages/web:
1. npm run typecheck — проверь что нет ошибок типизации
2. npm run lint — проверь что нет ошибок линтера

Если есть ошибки — исправь их.
```

**Тест:** Все проверки проходят без ошибок

---

### Шаг 13: Запуск всех тестов — 

**Статус:**

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Запусти все тесты проекта и убедись что они проходят.

```
Запусти в packages/web:
npm run test

Убедись что все тесты проходят.
Если есть падения — исправь тесты или код.
```

**Тест:** Все тесты проходят

---

### Шаг 14: Написать отчёт — 

**Статус:**

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из прототипа `docs/design/main-page.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Напиши итоговый отчёт о реализации фичи.

```
Создай файл docs/reports/2026-06-21-feat-003-redesign-main-page.md

Содержание:
- Что сделано
- Список изменённых файлов
- Результаты тестов
- Проблемы (если были)
- Итоговый статус
```

---
