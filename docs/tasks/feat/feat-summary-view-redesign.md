# Prompted: Summary view — full-screen bottom sheet

**Фича:** 004-summary-view-redesign

---

## Контекст

Текущая реализация summary встроена прямо в `ChatWindow.tsx` как inline-блок внизу чата. Это создаёт проблемы:

- Summary занимает половину экрана вместе с чатом — неудобно для просмотра
- 10-й вопрос не попадает в summary (последний вопрос не имеет ответа/оценки)
- Нет возможности свернуть/развернуть summary

**Прототип:** `C:\JS\ai-helper\ai-interview-simulator\docs\design\summary-view.html`
**Статус:** Новая фича

---

## Требования

1. **Full-screen summary:** После завершения интервью summary занимает весь экран, перекрывая чат
2. **9 вопросов:** В summary попадают вопросы 1–9 (10-й вопрос задаётся, но на него нет ответа — интервью завершается после 9 ответов)
3. **Bottom sheet:** Summary реализован как bottom sheet (по аналогии с Android bottom sheet / pull-down menu):
   - По умолчанию развёрнут на весь экран
   - Можно свернуть, потянув за handle bar вниз
   - Можно развернуть обратно, потянув за handle bar вверх или нажав на handle bar
   - Плавная анимация сворачивания/разворачивания
   - При свёрнутом состоянии — видна только верхняя полоска (handle bar) с заголовком
4. **Дизайн по прототипу:** Все визуальные элементы берутся из `docs/design/summary-view.html`

---

## Изменения в данных

- `TOTAL_QUESTIONS` остаётся = 10
- В summary отображаются вопросы 1–9 (ответы + оценки)
- 10-й вопрос задаётся, но интервью завершается без ожидания ответа — summary показывает результат по 9 вопросам
- Статистика (средний, лучший, худший балл) считается по 9 вопросам

---

## Общие правила (для каждого шага)

1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй существующие CSS-переменные из `docs/design/summary-view.html`
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
3. Используй существующие CSS-переменные из `docs/design/summary-view.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код
6. Не удаляй существующую функциональность
7. После реализации — запусти тесты и напиши отчёт в `docs/reports/`

---

Добавь в `packages/web/tailwind.config.ts` анимации и ключевые кадры для bottom sheet.

```
Обнови файл packages/web/tailwind.config.ts.

Добавь в theme.extend:
- animation: slide-up-bottom-sheet, slide-down-bottom-sheet, fade-in-overlay
- keyframes:
  - slideUpBottomSheet: from translateY(100%) to translateY(0)
  - slideDownBottomSheet: from translateY(0) to translateY(100%)
  - fadeInOverlay: from opacity 0 to opacity 1

Сохрани существующие настройки.
```

**Тест:** `npm run typecheck` в `packages/web`

---

### Шаг 2: Создать компонент BottomSheet — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
4. Не добавляй комментарии в код

---

Создай переиспользуемый компонент `packages/web/components/BottomSheet.tsx`.

```
Создай новый файл packages/web/components/BottomSheet.tsx.

Компонент:
- "use client" директива
- Пропсы:
  - isOpen (boolean) — развёрнут/свёрнут
  - onToggle (() => void) — переключение состояния
  - title (string) — заголовок в свёрнутом состоянии
  - children (ReactNode) — содержимое
- Состояние:
  - isDragging (boolean) — флаг перетаскивания
  - dragStartY (number) — начальная позиция drag
- Поведение:
  - Drag: touch/mouse events на handle bar
    - onPointerDown: фиксируем startY
    - onPointerMove: если拖动 вниз > 80px → onToggle (свернуть), если拖动 вверх > 80px → onToggle (развернуть)
    - onPointerUp: сброс
  - Клик по handle bar: toggle состояние
- Стили (из прототипа summary-view.html):
  - Контейнер: fixed, bottom-0, left-0, right-0, z-50
  - Развёрнутое: h-full (весь экран), transition-all duration-300
  - Свёрнутое: h-16 (только handle bar), transition-all duration-300
  - Handle bar: h-16, flex items-center justify-center, cursor-grab
    - Черта по центру: w-12 h-1.5 rounded-full bg-gray-300 (или через CSS-переменную)
    - Заголовок: ml-4, text-sm, font-medium
  - Содержимое: overflow-y-auto, padding 30px
  - Background: glass-bg, backdrop-blur(30px), border-top
- Анимация: transition-all duration-300 ease-in-out

Создай тест packages/web/components/__tests__/BottomSheet.test.tsx:
- Рендерится без ошибок
- Отображает handle bar и заголовок
- Вызывает onToggle при клике на handle bar
- Применяет правильные стили в зависимости от isOpen
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 3: Создать компонент SummaryView — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Используй дизайн из прототипа `docs/design/summary-view.html`
4. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
5. Не добавляй комментарии в код

---

Создай компонент `packages/web/components/SummaryView.tsx` с полным дизайном из прототипа.

```
Создай новый файл packages/web/components/SummaryView.tsx.

Типы:
- QuestionFeedback: { number: number, score: number, strengths: string[], weaknesses: string[], recommendation: string, analysis: string, improved: string, tips: string[] }

Компонент:
- "use client" директива
- Пропсы: feedbacks (QuestionFeedback[]) — массив оценок по вопросам 1-9
- Состояние: activeQuestion (number) — выбранный вопрос для просмотра
- Вычисляемая статистика:
  - averageScore: средний балл по всем feedbacks
  - bestScore: максимальный балл
  - worstScore: минимальный балл

JSX (внутри BottomSheet, content section):
1. Success banner:
   - Градиентный фон (success colors из прототипа: rgba(16,185,129,0.1))
   - Текст: "Интервью завершено! Все ${feedbacks.length + 1} вопросов задано."
   - Анимация slideDown

2. Stats grid (3 карточки):
   - Средний балл (averageScore) — gradient text (accent → pink)
   - Лучший (bestScore) — gradient text (success → green)
   - Худший (worstScore) — gradient text (danger → red)
   - Каждая карточка: glass, border, rounded-2xl, p-7, text-center
   - Анимация slideUp

3. Questions navigation:
   - Кнопки "Вопрос 1" ... "Вопрос N" (где N = feedbacks.length)
   - Кнопки в строку с flex-wrap
   - Активная кнопка: bg-accent, text-white
   - Hover: bg-accent, translateY(-2px)

4. Question detail card (для выбранного вопроса):
   - Header: "Вопрос N / ${feedbacks.length}" + large score display (/10)
   - Секции:
     - Сильные стороны (strengths) — зелёный заголовок, список
     - Слабые стороны (weaknesses) — красный заголовок, список
     - Рекомендация (recommendation) — акцентный заголовок
     - Разбор ответа (analysis) — оранжевый заголовок
     - Улучшенный ответ (improved) — зелёный заголовок, pre-wrap
     - Советы (tips) — акцентный заголовок, список

Стили берутся из прототипа docs/design/summary-view.html:
- .success-banner: bg gradient success, border success, rounded-2xl, p-5, text-center, mb-7
- .stats-grid: grid, repeat(auto-fit, minmax(200px, 1fr)), gap-5, mb-10
- .stat-card: glass, backdrop-blur(30px), border, rounded-[20px], p-7, text-center
- .stat-value: text-5xl, font-bold, gradient text
- .questions-nav: flex, gap-2.5, mb-7, flex-wrap, p-5, glass, border, rounded-2xl
- .question-btn: px-5 py-3, bg-secondary, border, rounded-[10px], cursor-pointer
- .question-card: glass, border, rounded-3xl, p-10, mb-7
- .section-title: text-lg, font-semibold, mb-4
- .section-content: bg-secondary, rounded-xl, p-5, border, leading-relaxed

Создай тест packages/web/components/__tests__/SummaryView.test.tsx:
- Рендерится без ошибок
- Отображает stats grid с правильными значениями
- Отображает навигацию по вопросам
- Переключает вопрос при клике на кнопку
- Отображает все секции feedback
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 4: Интегрировать SummaryView в ChatWindow — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Следуй conventions проекта: Next.js App Router, TypeScript, Tailwind CSS
4. Не добавляй комментарии в код
5. Не удаляй существующую функциональность

---

Обнови `packages/web/components/ChatWindow.tsx` для замены inline-summary на BottomSheet + SummaryView.

```
Обнови файл packages/web/components/ChatWindow.tsx.

Изменения:
1. Импорты: добавить BottomSheet, SummaryView
2. Новое состояние: isSummaryOpen (boolean, default true)
3. Логика завершения:
   - Когда isFinished=true → isSummaryOpen=true (summary автоматически открывается)
   - При 10-м вопросе: интервью завершается после 9 ответов, 10-й вопрос не ожидает ответа
4. Замена inline-summary:
   - Убрать текущий inline-summary блок из ChatWindow (строки ~138-176)
   - Вместо этого: показать BottomSheet с SummaryView когда isFinished=true
   - BottomSheet оборачивает SummaryView
   - При свёрнутом BottomSheet — чат скрыт за ним (summary перекрывает весь экран)
   - Handle bar bottom sheet: "Результаты интервью"
5. Преобразование данных:
   - allFeedbacks → map в QuestionFeedback[] формат (убедиться что поля совпадают)
6. При bottom sheet свёрнутом:
   - Handle bar остаётся видимой внизу экрана
   - Чат не отображается (summary перекрывает)
   - Пользователь может развернуть обратно

Стили ChatWindow:
- Убрать условный рендеринг input area / summary
- Chat input area: всегда видна когда !isFinished
- Когда isFinished: BottomSheet перекрывает весь экран
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 5: Обновить логику вопросов (9 vs 10) — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)
3. Не удаляй существующую функциональность

---

Обнови логику завершения интервью в `ChatWindow.tsx`.

```
Обнови файл packages/web/components/ChatWindow.tsx.

Изменения:
- TOTAL_QUESTIONS остаётся = 10
- Интервью завершается когда questionCount >= 9 (после 9 ответов)
- 10-й вопрос задаётся, но пользователь на него не отвечает — сразу показывается summary
- allFeedbacks содержит 9 элементов (вопросы 1-9)
- Прогресс в Header: показывает 9/10 → 10/10 при завершении

Логика:
- Отправляем ответ на вопрос N → получаем nextQuestion (вопрос N+1)
- Если N+1 = 10: показываем 10-й вопрос, но не ждём ответа, сразу isFinished=true
- Если N < 9: обычный цикл
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 6: Обновить тесты ChatWindow — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)

---

Обнови тесты для ChatWindow.

```
Обнови файл packages/web/components/__tests__/ChatWindow.test.tsx (или создай если нет).

Обнови моки:
- Добавь моки для BottomSheet и SummaryView

Обнови тесты:
- Рендерится без ошибок
- Отправка ответа вызывает API
- При завершении (9 ответов) показывается BottomSheet
- SummaryView получает 9 feedbacks
- BottomSheet переключается между открытым/закрытым состоянием
```

**Тест:** `npm run test` в `packages/web`

---

### Шаг 7: Запуск typecheck и lint — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)

---

```
Запусти в packages/web:
1. npm run typecheck — проверь что нет ошибок типизации
2. npm run lint — проверь что нет ошибок линтера

Если есть ошибки — исправь их.
```

**Тест:** Все проверки проходят без ошибок

---

### Шаг 8: Запуск всех тестов — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)

---

```
Запусти в packages/web:
npm run test

Убедись что все тесты проходят.
Если есть падения — исправь тесты или код.
```

**Тест:** Все тесты проходят

---

### Шаг 9: Написать отчёт — ✅

**Статус:** Готово

**Общие правила для шага:**
1. Код должен компилироваться без ошибок (`npm run typecheck` в `packages/web`)
2. Тесты должны проходить (`npm run test` в `packages/web`)

---

Напиши итоговый отчёт о реализации фичи.

```
Создай файл docs/reports/2026-06-22-feat-004-summary-view-redesign.md

Содержание:
- Что сделано
- Список изменённых файлов
- Результаты тестов
- Проблемы (если были)
- Итоговый статус
```

---
