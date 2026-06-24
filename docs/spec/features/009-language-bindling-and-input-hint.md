# Feature: Языковая привязка промптов + подсказка в поле ввода

**Дата:** 2026-06-24
**Приоритет:** Medium
**Статус:** In Progress
**Компонент:** AI Core (tools) + Frontend (ChatWindow)

---

## Описание

Две задачи:

1. **Языковая привязка** — вопросы интервью, оценка и коучинг должны выводиться на том языке, на котором написана вакансия. Сейчас все промпты всегда на английском, даже если вакансия на русском.

2. **Подсказка в поле ввода** — в placeholder textarea добавить информацию о клавишах (Enter для отправки, Shift+Enter для переноса строки).

---

## Задача 1: Языковая привязка промптов

### Что нужно сделать

#### 1. Добавить поле `language` в `ParsedJob`

**Файл:** `src/agents/types.ts`

- Добавить `language: string` в интерфейс `ParsedJob`
- Значение — ISO 639-1 код языка (`"en"`, `"ru"`, `"de"`, `"fr"`, `"es"`, `"zh"` и т.д.)

#### 2. Обновить схемы валидации

**Файлы:**
- `src/security/schemas.ts` — `JobProfileSchema`: добавить `language: z.string().min(1)`
- `src/types/index.ts` — `SessionSchema.jobProfile`: добавить `language: z.string()`
- `src/storage/session-store.ts` — `JobProfile` interface: добавить `language: string`

#### 3. Определять язык вакансии в парсере

**Файл:** `src/tools/parse-job-description.tool.ts`

- Добавить поле `language` в user prompt парсера: `"language: ISO 639-1 code of the language the job description is written in"`
- Добавить `language` в JSON schema ответа
- При парсинге результата: проверить `typeof parsed.language === "string"`, fallback на `"en"` если не определён

#### 4. Передавать язык в промпты генерации вопросов

**Файл:** `src/tools/generate-question.tool.ts`

- В system prompt добавить блок:
  ```
  LANGUAGE: The job description is in ${langName}. You MUST generate the question, topic, and expectedAnswerCriteria in ${langName}.
  ```
- Маппинг кода → названия: `{ ru: "Russian", de: "German", fr: "French", es: "Spanish", zh: "Chinese" }`, fallback → `"English"`

#### 5. Передавать язык в промпт оценки

**Файл:** `src/tools/evaluate-answer.tool.ts`

- В system prompt добавить:
  ```
  LANGUAGE: The job description and interview are in ${langName}. You MUST output all evaluation fields (strengths, weaknesses, recommendation, perfectAnswerSummary) in ${langName}.
  ```

#### 6. Передавать язык в промпт коучинга

**Файл:** `src/agents/coach.agent.ts`

- В system prompt добавить:
  ```
  LANGUAGE: The job description and interview are in ${langName}. You MUST output all coaching feedback (explanation, improvedAnswer, tips) in ${langName}.
  ```

#### 7. Обновить все тесты

Все ParsedJob-литералы и JSON-моки в тестах должны содержать `language: "en"`.

### Критерии приёмки

- [ ] Вакансия на русском → вопросы на русском, оценка на русском, коучинг на русском
- [ ] Вакансия на английском → всё на английском (как раньше)
- [ ] Если язык не определён → fallback `"en"`
- [ ] Все тесты проходят (typecheck, lint, test)

---

## Задача 2: Подсказка в поле ввода

### Что нужно сделать

#### Обновить placeholder в ChatWindow

**Файл:** `packages/web/components/ChatWindow.tsx` (строка ~279)

**Было:**
```
placeholder={isFinished ? "Интервью завершено" : "Введите ваш ответ..."}
```

**Стало:**
```
placeholder={isFinished ? "Интервью завершено" : "Введите ваш ответ... (Enter — отправить, Shift+Enter — перенос строки)"}
```

#### Обновить тесты

**Файл:** `packages/web/components/ChatWindow.test.tsx`

- Все `getByPlaceholderText("Введите ваш ответ...")` → `getByPlaceholderText("Введите ваш ответ... (Enter — отправить, Shift+Enter — перенос строки)")`
- Количество: 6 вхождений

### Критерии приёмки

- [ ] Placeholder содержит подсказку о клавишах
- [ ] Подсказка видна только когда интервью активно (не при завершённом)
- [ ] Все тесты ChatWindow проходят
