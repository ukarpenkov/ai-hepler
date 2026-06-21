# 2026-06-22 — Redesign Chat Page to Match Prototype

## Goal

Переделать страницу диалога (интервью) в соответствии с прототипом `docs/design/chat-page.html`, сохранив консистентность стилей с главной страницей. Перенести Header, BurgerMenu, Sidebar и ThemeToggle с главной.

## Problem

Страница интервью имела упрощённую разметку: `h-screen flex flex-col` с ChatWindow на весь экран. Были проблемы:

1. `body` в `globals.css` имеет `overflow: hidden` + `display: flex; align-items: center; justify-content: center` — ломал layout чата
2. Прогресс-бар был внутри ChatWindow, а не в шапке
3. Не было Sidebar, кнопки закрытия, навигации на главную
4. MessageBubble — простые серые/синие пузыри без аватаров
5. Input area — стандартный textarea без стилизации как в прототипе

## Changes

### `components/Header.tsx`

- Добавлены опциональные пропсы: `progress`, `totalQuestions`, `onClose`
- Лого кликабельно → `router.push("/")`
- Кнопка закрытия чата (×) с hover-анимацией (rotate 90deg, red background)
- Прогресс-бар с градиентом `from-primary via-purple-500 to-pink-500` + анимация `gradientShift`
- Экспортируется как default для совместимости с главной страницей

### `components/MessageBubble.tsx`

- Аватары:  (AI, gradient primary→pink),  (USER, gradient emerald)
- Пузыри: user — gradient `from-primary to-pink-500`, assistant — `var(--msg-ai)` с backdrop-blur
- Радиусы: `rounded-tr-[4px]` для user, `rounded-tl-[4px]` для assistant
- Временные метки (HH:MM) под каждым сообщением
- Анимация появления `messageIn`

### `components/ChatWindow.tsx`

- Убран ProgressBar — теперь в Header через `onProgressChange` callback
- Внешний контейнер: `rounded-glass border border-[var(--border)] bg-[var(--chat-bg)] backdrop-blur-glass shadow-glass`
- Input area: стеклянный фон, textarea с `--input-bg`, кнопка отправки с gradient (➤)
- Auto-height для textarea
- `min-h-[50px] max-h-[120px]` для textarea

### `app/interview/page.tsx`

- Использует Header (с пропсами progress, onClose), Sidebar, overlay для мобильных
- Чат — фиксированный контейнер: `fixed top-[80px] left-5 right-5 bottom-5`
- Sidebar с fetched sessions
- `confirm()` перед закрытием интервью

### `app/interview/layout.tsx`

- `useEffect` сбрасывает body стили (`overflow: visible`, `display: block`)
- Восстанавливает при unmount

### `app/globals.css`

- Добавлены CSS-переменные в `:root` и `[data-theme="dark"]`:
  - `--chat-bg`, `--msg-ai`, `--msg-user`, `--input-bg`
- Добавлены `@keyframes messageIn` и `@keyframes gradientShift`

### Tests

- `Header.test.tsx` — добавлен mock `next/navigation`
- `MessageBubble.test.tsx` — `self-end`/`self-start` вместо `justify-end`/`justify-start`
- `ChatWindow.test.tsx` — placeholder "Введите ваш ответ...", `onProgressChange` вместо ProgressBar, Enter key вместо кнопки
- `interview/page.test.tsx` — добавлены mock Header и Sidebar

## Result

- typecheck: pass
- lint: pass
- tests: 52/52 pass
- Страница диалога выглядит как в прототипе: glass-контейнер, аватары, gradient-пузыри, прогресс в шапке, кнопка закрытия, Sidebar
