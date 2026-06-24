# Feature: Отправка формы по клавише Ctrl+Enter

**Дата:** 2026-06-24
**Приоритет:** Low
**Статус:** Done
**Компонент:** Frontend

---

## Описание

Пользователь вынужден каждый раз кликать кнопку "Начать интервью" мышкой после вставки текста вакансии. Это лишний шаг, особенно когда текст уже вставлен из буфера обмена.

## Текущее поведение

- Ввод текста в `<textarea>`
- Клик по кнопке "Начать интервью"
- Enter создаёт новую строку в textarea
- Нет способа отправить форму клавиатурой

## Ожидаемое поведение

- **Ctrl+Enter** (или Cmd+Enter на Mac) при `text.length >= 50` → вызывает `handleSubmit()`
- **Enter** → вставляет перенос строки (стандартное поведение textarea)
- **Ctrl+Enter** при `text.length < 50` → ничего не делает (без ошибки)
- При `isLoading === true` → Ctrl+Enter не отправляет форму

---

## Технические детали

### Реализация

Добавлен `onKeyDown` handler на `<textarea>` в `JobInputForm.tsx`:

```tsx
onKeyDown={(e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && jobText.length >= 50 && !isLoading) {
    e.preventDefault();
    handleSubmit();
  }
}}
```

### Связанные файлы

- `packages/web/components/JobInputForm.tsx` — компонент с textarea

---

## Acceptance Criteria

- [x] Ctrl+Enter при >= 50 символах отправляет форму
- [x] Enter вставляет перенос строки
- [x] Ctrl+Enter при < 50 символах не отправляет форму
- [x] Ctrl+Enter при загрузке не отправляет форму
- [x] typecheck и lint проходят без ошибок
