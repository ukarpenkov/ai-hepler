# Bug: Evaluation explanation doesn't match paraphrasing cheat detection

**Дата:** 2026-06-24
**Приоритет:** Medium
**Статус:** Fixed
**Компонент:** Backend — `src/tools/evaluate-answer.tool.ts`

## Описание

При копировании вопроса как ответа, система anti-cheat правильно определяет читерство и ставит оценку 1/10 с флагом `paraphrasing_question`. Однако поле `recommendation` содержитgeneric-сообщение типа "Никогда не оставляйте ответ пустым. Даже если не знаете точно..." вместо объяснения, что копирование вопроса — это не ответ.

## Ожидаемое поведение

При обнаружении `paraphrasing_question` в `recommendation` должно быть чёткое объяснение:
- Копирование/перефразирование вопроса — это не ответ
- На реальном собеседовании это немедленный отказ
- Нужно отвечать честно, даже если не знаешь всего

## Фактическое поведение

`recommendation`: "Never leave an answer empty. Even if you don't know exactly, say what you know about React.memo, useMemo, useCallback, and start explaining. An empty answer is a failure on an interview."

Объяснение не соответствует действительной причине низкой оценки — проблема не в пустом ответе, а в копипасте вопроса.

## Воспроизведение

1. Начать интервью
2. Скопировать текст вопроса и вставить как ответ
3. Получить оценку 1/10 (правильно)
4. Прочитать recommendation — сообщение про "пустой ответ" (неправильно)

## Корневая причина

Промпт для LLM не содержит инструкцию привязывать `recommendation` к конкретным `antiCheatFlags`. Модель генерирует общее предупреждение вместо адресного объяснения.

## Файл для исправления

`src/tools/evaluate-answer.tool.ts` — строка 23-24, инструкции anti-cheat.

## Компоненты для изменения

| Файл | Изменение |
|------|-----------|
| `src/tools/evaluate-answer.tool.ts` | Добавить в anti-cheat правила инструкцию: при `paraphrasing_question` recommendation ОБЯЗАН содержать объяснение что копирование вопроса — читерство |
