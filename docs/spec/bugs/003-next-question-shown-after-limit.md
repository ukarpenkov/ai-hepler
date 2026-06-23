# Bug: Next question shown after reaching TOTAL_QUESTIONS limit

**Дата:** 2026-06-23
**Приоритет:** High
**Статус:** Fixed
**Компонент:** Frontend — `ChatWindow.tsx`

## Описание

При `TOTAL_QUESTIONS = 1` (или любом другом значении) после отправки ответа на последний вопрос, ИИ задаёт следующий вопрос в чате. Сообщение с новым вопросом добавляется в массив messages до проверки `isFinished`, поэтому пользователь видит вопрос, который задавать уже не нужно.

## Ожидаемое поведение

- После ответа на последний вопрос показать **только фидбек** (балл + совет)
- **Не показывать** следующий вопрос — сразу переходить к summary/итогам

## Фактическое поведение

- После ответа на последний вопрос в чат добавляется и фидбек, и **следующий вопрос от ИИ**
- Пользователь видит лишний вопрос, хотя интервью уже завершено
- `isFinished` ставится в `true`, но сообщение с вопросом уже в DOM

## Воспроизведение

1. Установить `TOTAL_QUESTIONS = 1` в `ChatWindow.tsx`
2. Начать интервью, ответить на первый вопрос
3. **Наблюдение:** после фидбека появляется второй вопрос от ИИ
4. При этом `isFinished = true` и input скрыт — вопрос бесмысленен

## Причина

В `handleSend` (`ChatWindow.tsx:137-143`) следующий вопрос добавляется в messages **до** проверки `if (nextCount >= TOTAL_QUESTIONS)`:

```typescript
// Сообщение с вопросом добавляется ВСЕГДА
setMessages((prev) => [...prev, feedbackMsg, nextQuestionMsg]);

// А проверка идёт ПОЗЖЕ
if (nextCount >= TOTAL_QUESTIONS) {
  setIsFinished(true);
}
```

## Исправление

**Файл:** `packages/web/components/ChatWindow.tsx`

Следующий вопрос добавляется в messages **только** если `nextCount < TOTAL_QUESTIONS`:

```typescript
const nextQuestionMsg: ChatMessage | null =
  nextCount < TOTAL_QUESTIONS
    ? { role: "assistant", content: response.nextQuestion.question, topic: response.nextQuestion.topic }
    : null;

setMessages((prev) => [...prev, feedbackMsg, ...(nextQuestionMsg ? [nextQuestionMsg] : [])]);
```

## Компоненты для изменения

| Файл | Изменение |
|------|-----------|
| `packages/web/components/ChatWindow.tsx:137-143` | Условное добавление следующего вопроса в messages |
