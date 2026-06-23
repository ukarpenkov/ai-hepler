# Feature: Completed session UX — disabled input + results block

**Дата:** 2026-06-24
**Приоритет:** High
**Статус:** Done
**Компонент:** Frontend — ChatWindow

---

## Описание

При переходе на завершённую сессию (все вопросы заданы) интерфейс корректно отображает заблокированный инпут и блок результатов. Ранее: инпут скрывался полностью, `isFinished` не инициализировался из IndexedDB, при навигации на прошлую сессию поведение было непредсказуемым.

---

## Текущее поведение (до изменений)

- При загрузке завершённой сессии `isFinished` оставался `false` — инпут был активен
- `storedFeedbacks` загружались, но `isFinished` не ставился в `true`
- Блок инпута скрывался через `{!isFinished && (...)}` — при навигации мелькал активный инпут
- `BottomSheet` с `SummaryView` не отображался при загрузке (только после ответа)

---

## Ожидаемое поведение

### 1. Disabled input при завершении

- `textarea` и `button` отправки получают `disabled` при `isFinished === true`
- Placeholder меняется на «Интервью завершено»
- Блок инпута всегда виден (не скрыт), но неактивен
- Scrollbar-кресико инпута скрывается когда `isFinished`

### 2. Автоинициализация isFinished

- При загрузке `storedFeedbacks` из IndexedDB: если `storedFeedbacks.length >= TOTAL_QUESTIONS` → `setIsFinished(true)`
- При ответе на последний вопрос: `setIsFinished(true)` (как раньше)

### 3. BottomSheet с результатами

- При `isFinished === true` рендерится `BottomSheet` с `SummaryView`
- При загрузке завершённой сессии `isSummaryOpen = true` (summary разёрнут)
- Результаты (`allFeedbacks`) сохраняются в IndexedDB через `updateSession()`

---

## Acceptance Criteria

- [x] При загрузке завершённой сессии инпут disabled с placeholder «Интервью завершено»
- [x] Кнопка отправки disabled при `isFinished`
- [x] `BottomSheet` с `SummaryView` отображается при загрузке завершённой сессии
- [x] `isSummaryOpen = true` при загрузке завершённой сессии
- [x] Результаты (`allFeedbacks`) сохраняются в IndexedDB
- [x] Все тесты проходят
- [x] typecheck без ошибок
- [x] lint без ошибок (pre-existing warning допустим)

---

## Файлы для изменения

| Файл | Действие |
|------|----------|
| `packages/web/components/ChatWindow.tsx` | Обновить — логика `isFinished`, disabled input, placeholder |
| `packages/web/components/ChatWindow.test.tsx` | Обновить — тесты disabled input, мок `sessionData` |

---

## Приоритеты

| Элемент | Приоритет |
|---------|-----------|
| Инициализация `isFinished` из IndexedDB | **High** |
| Disabled input + placeholder | **High** |
| BottomSheet при загрузке | **High** |
| Тесты | **Medium** |
