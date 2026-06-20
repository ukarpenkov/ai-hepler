# Фаза 2 — Промты для реализации (Frontend)

---

## Шаг 1 — Инициализация Next.js проекта ✅ Выполнено

**Статус:** ✅ Выполнено

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Создай Next.js проект для фронтенда AI Interview Simulator.

Действия:
1. В корне проекта (ai-interview-simulator/) запусти: npx create-next-app@latest packages/web --typescript --tailwind --app --no-eslint --no-src-dir --import-alias "@/*"
2. Убедись что packages/web/ создался с app/ directory структурой
3. В packages/web/app/layout.tsx — базовый layout с html и body
4. В packages/web/app/page.tsx — пустая страница-заглушка "AI Interview Simulator"
5. В packages/web/package.json добавь скрипт "dev": "next dev -p 3000"
6. Запусти npm install в packages/web/

Тест: cd packages/web && npx next lint (должен пройти без ошибок)
```

---

## Шаг 2 — Конфигурация API клиента (lib/api.ts) ✅ Выполнено

**Статус:** ✅ Выполнено

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Создай API клиент для фронтенда.

Файл: packages/web/lib/api.ts

Требования:
1. Константа API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
2. Функция parseJob(text: string): Promise<{ sessionId: string, jobProfile: ParsedJob }>
   - POST /job/parse с body { text }
3. Функция startInterview(sessionId: string): Promise<{ question: QuestionResult }>
   - POST /interview/start с body { sessionId }
4. Функци️я sendAnswer(sessionId: string, answer: string): Promise<{ evaluation, coach, memory, nextQuestion }>
   - POST /interview/answer с body { sessionId, answer }
5. Функция getSession(id: string): Promise<SessionData>
   - GET /session/:id
6. Типы: ParsedJob, QuestionResult, EvaluationResult, CoachResult, MemoryUpdate, SessionData
   - Определи их в packages/web/lib/types.ts
7. Обработка ошибок: проверяй response.ok, бросай Error с message из JSON

Файл: packages/web/lib/types.ts
- Экспортируй все интерфейсы: ParsedJob, QuestionResult, EvaluationResult, CoachResult, MemoryUpdate, SessionData

Тест: packages/web/__tests__/api.test.ts
- мокай fetch
- тест parseJob вызывает POST /job/parse
- тест startInterview вызывает POST /interview/start
- тест sendAnswer вызывает POST /interview/answer
- тест getSession вызывает GET /session/:id
- тест обработка HTTP ошибки
```

---

## Шаг 3 — Компонент JobUpload (ввод вакансии) ✅ Выполнено

**Статус:** ✅ Выполнено

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Создай компонент JobUpload для ввода текста вакансии.

Файл: packages/web/components/JobUpload.tsx

Требования:
1. React компонент с пропсами: { onSubmit: (text: string) => void, isLoading: boolean }
2. Textarea с placeholder "Вставьте текст вакансии..."
3. Кнопка "Начать интервью"
4. Валидация: минимум 50 символов, иначе показать ошибку
5. Дизайн: Tailwind CSS, минималистичный стиль
6. Кнопка disabled пока isLoading или текст < 50 символов

Файл: packages/web/components/JobUpload.test.tsx
Тест (используй @testing-library/react и vitest):
- рендерит textarea и кнопку
- кнопка disabled когда текст пустой
- кнопка enabled когда текст >= 50 символов
- вызывает onSubmit при клике на кнопку

Доп. зависимости в packages/web/package.json (devDependencies): @testing-library/react, @testing-library/jest-dom, jsdom, vitest
Добавь vitest конфиг в packages/web/vitest.config.ts
```

---

## Шаг 4 — Компонент MessageBubble (вывод сообщений) ✅ Выполнено

**Статус:** ✅ Выполнено

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Создай компонент MessageBubble для отображения сообщений в чате.

Файл: packages/web/components/MessageBubble.tsx

Требования:
1. React компонент с пропсами: { role: "user" | "assistant", content: string, timestamp?: string }
2. Если role === "user" — сообщение справа, фон синий
3. Если role === "assistant" — сообщение слева, фон серый
4. Отображай timestamp если передан
5. Tailwind CSS стили
6. Text content с line-height

Файл: packages/web/components/MessageBubble.test.tsx
Тест:
- рендерит сообщение пользователя справа
- рендерит сообщение ассистента слева
- отображает timestamp если передан
```

---

## Шаг 5 — Компонент FeedbackCard (результат оценки) ✅ Выполнено

**Статус:** ✅ Выполнено

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Создай компонент FeedbackCard для отображения результатов оценки ответа.

Файл: packages/web/components/FeedbackCard.tsx

Требования:
1. React компонент с пропсами: { evaluation: EvaluationResult, coach: CoachResult }
2. Отображай:
   - Score (1-10) с цветовой индикацией (красный < 4, жёлтый 4-6, зелёный > 6)
   - Strengths (список)
   - Weaknesses (список)
   - Recommendation (текст)
   - Coach explanation (текст)
   - Improved answer (текст в блоке code)
   - Tips (список)
3. Tailwind CSS, карточка с тенью
4. Импортируй типы из @/lib/types

Файл: packages/web/components/FeedbackCard.test.tsx
Тест:
- рендерит score
- рендерит strengths и weaknesses
- рендерит coach explanation
- рендерит tips
```

---

## Шаг 6 — Компонент ChatWindow (основной чат интерфейс)

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Создай компонент ChatWindow — основной чат интерфейс.

Файл: packages/web/components/ChatWindow.tsx

Требования:
1. Пропсы: { sessionId: string, initialQuestion: QuestionResult }
2. Состояние: messages (массив { role, content }), currentInput, isLoading, lastFeedback (EvaluationResult | null), lastCoach (CoachResult | null)
3. При монтировании: добавь initialQuestion как первое сообщение assistant
4. Textarea + кнопка "Отправить"
5. При отправке:
   - Добавь сообщение user в messages
   - Вызови sendAnswer(sessionId, answer)
   - Добавь сообщение assistant с текстом следующего вопроса
   - Сохрани evaluation и coach в lastFeedback/lastCoach
6. Под textarea покажи FeedbackCard если есть lastFeedback
7. Скролл вниз автоматически при новых сообщениях
8. Кнопка disabled пока isLoading
9. Используй MessageBubble для рендеринга каждого сообщения

Тест: packages/web/components/ChatWindow.test.tsx
- мокай sendAnswer
- рендерит начальный вопрос
- отправка ответа добавляет сообщение user
- после ответа отображается FeedbackCard
```

---

## Шаг 7 — Страница главная (app/page.tsx)

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Создай главную страницу приложения.

Файл: packages/web/app/page.tsx

Требования:
1. Client Component ("use client")
2. Состояние: jobText, isLoading, error, sessionId
3. При submit jobText:
   - Вызови parseJob(text) из lib/api
   - Сохрани sessionId
   - Вызови startInterview(sessionId) для получения первого вопроса
   - Перенаправь на /interview с параметрами sessionId и initialQuestion
4. Используй компонент JobUpload
5. Если ошибка — покажи сообщение
6. Tailwind CSS: центрированный контейнер, заголовок "AI Interview Simulator"

Тест: packages/web/app/__tests__/page.test.tsx
- мокай api функции
- рендерит заголовок
- рендерит JobUpload
```

---

## Шаг 8 — Страница интервью (app/interview/page.tsx)

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Создай страницу интервью.

Файл: packages/web/app/interview/page.tsx

Требования:
1. Client Component ("use client")
2. Читай searchParams: sessionId, question, topic, difficulty
3. Если нет sessionId — редирект на /
4. Создай объект QuestionResult из searchParams
5. Рендерий ChatWindow с sessionId и initialQuestion
6. Tailwind CSS: полная высота экрана

Файл: packages/web/app/interview/layout.tsx
- Простой layout без навигации

Тест: packages/web/app/interview/__tests__/page.test.tsx
- мокай useSearchParams
- рендерит ChatWindow
```

---

## Шаг 9 — Layout и навигация (app/layout.tsx)

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Обнови корневой layout приложения.

Файл: packages/web/app/layout.tsx

Требования:
1. Metadata: title "AI Interview Simulator", description "Practice interviews with AI"
2. Inter шрифт через next/font/google
3. Tailwind CSS globals: убери стандартные стили, оставь только базовый reset
4. Body: min-height screen, bg-gray-50, text-gray-900

Файл: packages/web/app/globals.css
- Tailwind directives: @tailwind base, @tailwind components, @tailwind utilities
- Минимальные глобальные стили

Тест: packages/web/app/__tests__/layout.test.tsx
- рендерит children
- содержит title
```

---

## Шаг 10 — Компонент ProgressBar (прогресс интервью)

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Создай компонент ProgressBar для отображения прогресса интервью.

Файл: packages/web/components/ProgressBar.tsx

Требования:
1. Пропсы: { current: number, total: number }
2. Визуальная полоса прогресса (div с bg-blue-500, width в процентах)
3. Текст: "Вопрос X из Y"
4. Tailwind CSS

Файл: packages/web/components/ProgressBar.test.tsx
- рендерит правильный текст
- ширина полосы соответствует проценту
```

---

## Шаг 11 — Интеграция ProgressBar в ChatWindow

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Интегрируй ProgressBar в ChatWindow.

Обнови packages/web/components/ChatWindow.tsx:
1. Добавь состояние questionCount (начальное = 1)
2. При каждом ответе инкрементируй questionCount
3. Покажи ProgressBar над чатом: current={questionCount}, total={10}
4. Импортируй ProgressBar

Тест: packages/web/components/ChatWindow.test.tsx (обнови)
- после отправки ответа questionCount увеличивается
- ProgressBar отображает текущий номер вопроса
```

---

## Шаг 12 — Стилизация и финальная настройка Tailwind

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Финализируй стилизацию фронтенда.

Действия:
1. Проверь что все компоненты используют Tailwind классы
2. Убедись что responsive (mobile-friendly)
3. Добавь hover/focus состояния для кнопок и textarea
4. Проверь что текст читаемый (font-size, contrast)
5. Проверь что скролл работает корректно в ChatWindow

Файл: packages/web/tailwind.config.ts
- Убедись что content пути правильные

Тест: cd packages/web && npx next build (должен собраться без ошибок)
```

---

## Шаг 13 — Конфигурация окружения для фронта

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Настрой конфигурацию окружения для фронтенда.

Файлы:
1. packages/web/.env.example:
   NEXT_PUBLIC_API_URL=http://localhost:3001

2. packages/web/.gitignore (добавь в корневой):
   - .next
   - out
   - packages/web/.next

3. Обнови packages/web/lib/api.ts:
   - API_BASE должен читать process.env.NEXT_PUBLIC_API_URL

4. Проверь что build работает с правильными переменными
```

---

## Шаг 14 — Исправление импортов и связей между компонентами

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Проверь и исправь все связи между компонентами фронтенда.

Действия:
1. Проверь что все import пути корректны (@/components/*, @/lib/*)
2. Проверь что типы импортируются из @/lib/types
3. Проверь что React Server Components и Client Components правильно разделены
4. Убедись что "use client" есть на всех компонентах с useState/useEffect
5. Исправь любые ошибки импортов

Запусти:
- cd packages/web && npx tsc --noEmit
- cd packages/web && npx next lint

Все должны пройти без ошибок.
```

---

## Шаг 15 — Финальная проверка фронтенда

**Статус:**

> **Общие правила (действуют для КАЖДОГО шага):**
> 1. Язык кода — TypeScript.
> 2. Не добавляй комментарии в код, кроме JSDoc где необходимо.
> 3. Не коммить автоматически — жди подтверждения.
> 4. После каждого шага запускай `npm run typecheck`, `npm run lint`, `npm run test`. Все три должны пройти.
> 5. Файлы структуры: `packages/web/` — исходники фронта.
> 6. Используй существующие библиотеки, не добавляй новые без необходимости.
> 7. Без feature flags и backwards-compat шимов — если меняешь, меняй напрямую.
> 8. После выполнения шага отмечай его статус «Выполнено» в заголовке.
> 9. Перед началом нового шага проверяй что предыдущий шаг отмечен как «Выполнено».
> 10. После каждого шага пиши отчёт в `docs/reports/` с именем `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Промт:**

```
Проведи финальную проверку фронтенда:

1. Запусти cd packages/web && npx tsc --noEmit — исправь все ошибки типов
2. Запусти cd packages/web && npx next lint — исправь все warnings и errors
3. Запусти cd packages/web && npx vitest run — убедись что все тесты проходят
4. Запусти cd packages/web && npx next build — убедись что build работает
5. Проверь что структура файлов полная:
   packages/web/app/page.tsx
   packages/web/app/layout.tsx
   packages/web/app/globals.css
   packages/web/app/interview/page.tsx
   packages/web/app/interview/layout.tsx
   packages/web/components/JobUpload.tsx
   packages/web/components/MessageBubble.tsx
   packages/web/components/FeedbackCard.tsx
   packages/web/components/ChatWindow.tsx
   packages/web/components/ProgressBar.tsx
   packages/web/lib/api.ts
   packages/web/lib/types.ts
6. Проверь что .env.example содержит NEXT_PUBLIC_API_URL

Все команды должны пройти без ошибок.
```
