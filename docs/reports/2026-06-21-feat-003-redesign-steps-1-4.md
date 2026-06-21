# 003-redesign-main-page — Шаги 1-4

**Дата:** 2026-06-21

## Что сделано

### Шаг 1: Tailwind config
- Добавлены кастомные цвета: `primary` (#6366f1, hover #4f46e5, dark #818cf8), `surface` (bg, card, secondary), `content` (primary, secondary)
- Добавлены `borderRadius`: glass (24px), card (16px), button (16px)
- Добавлен `backdropBlur.glass` (30px)
- Добавлены `boxShadow`: glass, button
- Добавлены `animation`: slide-up, float
- Добавлены `keyframes`: slideUp, float

### Шаг 2: globals.css
- Добавлены CSS-переменные `:root` для светлой темы
- Добавлены CSS-переменные `[data-theme="dark"]` для тёмной темы
- Добавлен `.glass` utility класс

### Шаг 3: ThemeToggle
- Создан компонент `packages/web/components/ThemeToggle.tsx`
- Переключение темы light/dark с сохранением в localStorage
- Автоопределение prefers-color-scheme
- Установка data-theme на documentElement
- Создан тест `ThemeToggle.test.tsx` (3 теста)

### Шаг 4: BurgerMenu
- Создан компонент `packages/web/components/BurgerMenu.tsx`
- Toggle sidebar с анимацией в крестик
- Пропсы: isOpen, onClick
- Создан тест `BurgerMenu.test.tsx` (3 теста)

## Изменённые файлы

| Файл | Тип |
|------|-----|
| `packages/web/tailwind.config.ts` | Изменён |
| `packages/web/app/globals.css` | Изменён |
| `packages/web/components/ThemeToggle.tsx` | Создан |
| `packages/web/components/ThemeToggle.test.tsx` | Создан |
| `packages/web/components/BurgerMenu.tsx` | Создан |
| `packages/web/components/BurgerMenu.test.tsx` | Создан |

## Результаты проверок

- `npm run typecheck`: ✅ проходит
- `npm run test`: ✅ все новые тесты проходят (6/6)

## Known issues

- `ChatWindow.test.tsx` — pre-existing bug (тест ожидает "Отличный ответ", компонент рендерит "Добавьте примеры"). Не связан с данными изменениями.

## Итоговый статус

✅ Шаги 1-4 выполнены успешно
