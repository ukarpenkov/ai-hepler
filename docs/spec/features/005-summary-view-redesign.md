# Feature: Summary view — full-screen bottom sheet

**Дата:** 2026-06-22
**Приоритет:** High
**Статус:** Open
**Компонент:** Frontend — UI/UX

---

## Описание

Полная переделка блока summary (итоги интервью). Текущая реализация встроена в `ChatWindow` как inline-блок и занимает половину экрана вместе с чатом. Новая версия — full-screen bottom sheet по аналогии с Android pull-down меню: summary перекрывает весь экран, его можно свернуть drag-жестом или кликом по handle bar.

**Прототип:** `docs/design/summary-view.html`
**Таск-файл:** `docs/tasks/feat/feat-summary-view-redesign.md`

---

## Текущее поведение

- Summary встроен в `ChatWindow.tsx` как условный блок (когда `isFinished === true`)
- Занимает нижнюю часть экрана вместе с чатом — неудобно для просмотра
- 10-й вопрос не попадает в summary (после 9 ответов интервью завершается, но summary показывает все 10 кнопок навигации)
- Нет возможности свернуть/развернуть summary
- Дизайн отличается от прототипа `summary-view.html`

---

## Ожидаемое поведение

### 1. Bottom Sheet (основной контейнер)

Summary реализован как **bottom sheet** — панель, поднимающаяся снизу:

- **Развёрнутое состояние (по умолчанию):** занимает весь экран (`h-full`), перекрывает чат
- **Свёрнутое состояние:** видна только полоска- handle bar (h-16, ~64px) внизу экрана + заголовок "Результаты интервью"
- **Переключение:**
  - Клик по handle bar — toggle (свернуть/развернуть)
  - Drag вниз > 80px — свернуть
  - Drag вверх > 80px — развернуть
- **Анимация:** `transition-all duration-300 ease-in-out` (плавный slide)
- **Позиционирование:** `fixed bottom-0 left-0 right-0 z-50`
- **Handle bar:** по центру горизонтальная черта (w-12 h-1.5 rounded-full) + заголовок слева

### 2. Summary Content (содержимое)

При завершении интервью summary показывает:

#### 2.1 Success Banner
- Градиентный фон (success colors: `rgba(16,185,129,0.1)` → `rgba(52,211,153,0.1)`)
- Текст: "Интервью завершено! Все N вопросов задано." (где N = количество вопросов с ответами + 1)
- Анимация `slideDown` при появлении

#### 2.2 Stats Grid (3 карточки)
| Карточка | Значение | Цвет текста |
|----------|----------|-------------|
| Средний балл | Среднее арифметическое оценок | Gradient: accent → pink |
| Лучший | Максимальная оценка | Gradient: success → green |
| Худший | Минимальная оценка | Gradient: danger → red |

- Стили: glass, backdrop-blur(30px), border, rounded-2xl, p-7, text-center
- Анимация `slideUp` при появлении

#### 2.3 Questions Navigation
- Кнопки "Вопрос 1" ... "Вопрос N" в строку с `flex-wrap`
- Активная кнопка: `bg-accent`, `text-white`
- Hover: `bg-accent`, `translateY(-2px)`, `box-shadow`
- Контейнер: glass, border, rounded-2xl, p-5

#### 2.4 Question Detail Card
Для выбранного вопроса отображается карточка:

- **Header:** "Вопрос N / M" + крупный score (`/10`)
- **Секции:**
  - Сильные стороны (strengths) — зелёный заголовок, список
  - Слабые стороны (weaknesses) — красный заголовок, список
  - Рекомендация (recommendation) — акцентный заголовок, текст
  - Разбор ответа (analysis) — оранжевый заголовок, текст
  - Улучшенный ответ (improved) — зелёный заголовок, pre-wrap текст
  - Советы (tips) — акцентный заголовок, список

### 3. Логика вопросов (9 vs 10)

- `TOTAL_QUESTIONS = 10`
- Интервью завершается после **9 ответов**
- 10-й вопрос задаётся, но ответ не собирается — summary показывается сразу
- Summary содержит **9 feedback-записей** (вопросы 1–9)
- Статистика считается по 9 вопросам
- Прогресс в Header: 9/10 → 10/10 при завершении

### 4. Интеграция с ChatWindow

- Когда `isFinished === true` → BottomSheet с SummaryView перекрывает весь экран
- Chat input area скрыта за summary
- Handle bar bottom sheet видна всегда (даже в свёрнутом состоянии)
- При свёрнутом bottom sheet — пользователь видит handle bar с заголовком

---

## Дизайн-система (CSS-переменные)

### Светлая тема

| Переменная | Значение |
|------------|----------|
| `--bg-primary` | `#f5f7fa` |
| `--bg-secondary` | `rgba(255,255,255,0.7)` |
| `--text-primary` | `#1a1a1a` |
| `--text-secondary` | `#6b7280` |
| `--accent` | `#6366f1` |
| `--accent-hover` | `#4f46e5` |
| `--border` | `rgba(255,255,255,0.3)` |
| `--shadow` | `rgba(0,0,0,0.08)` |
| `--glass-bg` | `rgba(255,255,255,0.6)` |
| `--success` | `#10b981` |
| `--success-bg` | `rgba(16,185,129,0.1)` |
| `--danger` | `#ef4444` |
| `--danger-bg` | `rgba(239,68,68,0.1)` |
| `--warning` | `#f59e0b` |
| `--warning-bg` | `rgba(245,158,11,0.1)` |

### Тёмная тема

| Переменная | Значение |
|------------|----------|
| `--bg-primary` | `#0f172a` |
| `--bg-secondary` | `rgba(30,41,59,0.7)` |
| `--text-primary` | `#f1f5f9` |
| `--text-secondary` | `#94a3b8` |
| `--accent` | `#818cf8` |
| `--accent-hover` | `#6366f1` |
| `--border` | `rgba(255,255,255,0.1)` |
| `--shadow` | `rgba(0,0,0,0.3)` |
| `--glass-bg` | `rgba(30,41,59,0.6)` |
| `--success` | `#34d399` |
| `--success-bg` | `rgba(52,211,153,0.1)` |
| `--danger` | `#f87171` |
| `--danger-bg` | `rgba(248,113,113,0.1)` |
| `--warning` | `#fbbf24` |
| `--warning-bg` | `rgba(251,191,36,0.1)` |

---

## Техническая реализация

### Tailwind CSS — новые анимации

```ts
// tailwind.config.ts — добавить в theme.extend
animation: {
  "slide-up-bottom-sheet": "slideUpBottomSheet 0.3s ease-in-out",
  "slide-down-bottom-sheet": "slideDownBottomSheet 0.3s ease-in-out",
  "fade-in-overlay": "fadeInOverlay 0.3s ease",
},
keyframes: {
  slideUpBottomSheet: {
    from: { transform: "translateY(100%)" },
    to: { transform: "translateY(0)" },
  },
  slideDownBottomSheet: {
    from: { transform: "translateY(0)" },
    to: { transform: "translateY(100%)" },
  },
  fadeInOverlay: {
    from: { opacity: "0" },
    to: { opacity: "1" },
  },
},
```

### BottomSheet.tsx

```tsx
"use client";

import { useState, useRef, useCallback } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onToggle, title, children }: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    if (delta > 80) { onToggle(); setIsDragging(false); }
    else if (delta < -80) { onToggle(); setIsDragging(false); }
  }, [isDragging, onToggle]);

  const handlePointerUp = useCallback(() => setIsDragging(false), []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isOpen ? "h-full" : "h-16"
      }`}
      style={{ background: "var(--glass-bg)", backdropFilter: "blur(30px)", borderTop: "1px solid var(--border)" }}
    >
      <div
        className="h-16 flex items-center justify-center cursor-grab select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={onToggle}
      >
        <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        <span className="ml-4 text-sm font-medium">{title}</span>
      </div>
      {isOpen && <div className="overflow-y-auto h-[calc(100%-64px)] p-[30px]">{children}</div>}
    </div>
  );
}
```

### SummaryView.tsx

```tsx
"use client";

import { useState } from "react";

interface QuestionFeedback {
  number: number;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  analysis: string;
  improved: string;
  tips: string[];
}

interface SummaryViewProps {
  feedbacks: QuestionFeedback[];
}

export default function SummaryView({ feedbacks }: SummaryViewProps) {
  const [activeQuestion, setActiveQuestion] = useState(1);

  const averageScore = feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length;
  const bestScore = Math.max(...feedbacks.map((f) => f.score));
  const worstScore = Math.min(...feedbacks.map((f) => f.score));

  const active = feedbacks.find((f) => f.number === activeQuestion) || feedbacks[0];

  return (
    <div>
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-[rgba(16,185,129,0.1)] to-[rgba(52,211,153,0.1)] border border-[rgba(16,185,129,0.3)] rounded-2xl p-5 text-center mb-7">
        <h2 className="text-[var(--success)] text-xl font-semibold">
          Интервью завершено! Все {feedbacks.length + 1} вопросов задано.
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-10">
        <div className="glass rounded-[20px] p-7 text-center">
          <div className="text-5xl font-bold bg-gradient-to-br from-[var(--accent)] to-pink-500 bg-clip-text text-transparent mb-2">
            {averageScore.toFixed(1)}
          </div>
          <div className="text-sm text-[var(--text-secondary)] font-medium">Средний балл</div>
        </div>
        <div className="glass rounded-[20px] p-7 text-center">
          <div className="text-5xl font-bold bg-gradient-to-br from-[var(--success)] to-green-400 bg-clip-text text-transparent mb-2">
            {bestScore}
          </div>
          <div className="text-sm text-[var(--text-secondary)] font-medium">Лучший</div>
        </div>
        <div className="glass rounded-[20px] p-7 text-center">
          <div className="text-5xl font-bold bg-gradient-to-br from-[var(--danger)] to-red-400 bg-clip-text text-transparent mb-2">
            {worstScore}
          </div>
          <div className="text-sm text-[var(--text-secondary)] font-medium">Худший</div>
        </div>
      </div>

      {/* Questions Navigation */}
      <div className="flex gap-2.5 flex-wrap p-5 glass border border-[var(--border)] rounded-2xl mb-7">
        {feedbacks.map((f) => (
          <button
            key={f.number}
            onClick={() => setActiveQuestion(f.number)}
            className={`px-5 py-3 rounded-[10px] border border-[var(--border)] text-sm font-medium cursor-pointer transition-all duration-300 ${
              activeQuestion === f.number
                ? "bg-[var(--accent)] text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]"
                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(99,102,241,0.3)]"
            }`}
          >
            Вопрос {f.number}
          </button>
        ))}
      </div>

      {/* Question Detail Card */}
      <div className="glass border border-[var(--border)] rounded-3xl p-10 mb-7">
        <div className="flex justify-between items-center mb-7 pb-5 border-b border-[var(--border)]">
          <div className="text-lg font-semibold text-[var(--text-secondary)]">Вопрос {active.number} / {feedbacks.length}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-bold bg-gradient-to-br from-[var(--accent)] to-pink-500 bg-clip-text text-transparent leading-none">
              {active.score}
            </span>
            <span className="text-2xl text-[var(--text-secondary)] font-medium">/ 10</span>
          </div>
        </div>

        {/* Sections: strengths, weaknesses, recommendation, analysis, improved, tips */}
        {/* ... каждый section с section-title и section-content ... */}
      </div>
    </div>
  );
}
```

---

## Файлы для изменения

| Файл | Действие |
|------|----------|
| `packages/web/tailwind.config.ts` | Обновить — добавить анимации bottom sheet |
| `packages/web/components/BottomSheet.tsx` | **Новый** — универсальный bottom sheet с drag |
| `packages/web/components/SummaryView.tsx` | **Новый** — дизайн summary из прототипа |
| `packages/web/components/ChatWindow.tsx` | Обновить — замена inline-summary на BottomSheet + SummaryView, логика 9/10 |
| `packages/web/components/__tests__/BottomSheet.test.tsx` | **Новый** — тесты bottom sheet |
| `packages/web/components/__tests__/SummaryView.test.tsx` | **Новый** — тесты summary view |
| `packages/web/components/__tests__/ChatWindow.test.tsx` | Обновить — тесты новой логики |

---

## Acceptance Criteria

- [ ] Summary занимает весь экран после завершения интервью
- [ ] Handle bar видна по центру сверху summary (черта + заголовок)
- [ ] Клик по handle bar сворачивает/разворачивает summary
- [ ] Drag вниз > 80px сворачивает summary
- [ ] Drag вверх > 80px разворачивает summary
- [ ] Анимация сворачивания/разворачивания плавная (300ms)
- [ ] При свёрнутом summary видна только handle bar с заголовком "Результаты интервью"
- [ ] Summary содержит 9 вопросов (1–9)
- [ ] Статистика (средний/лучший/худший) считается по 9 вопросам
- [ ] Success banner показывает правильное количество вопросов
- [ ] Навигация по вопросам работает (кнопки 1–9)
- [ ] Карточка вопроса содержит все 6 секций (strengths, weaknesses, recommendation, analysis, improved, tips)
- [ ] Дизайн соответствует прототипу `docs/design/summary-view.html`
- [ ] 10-й вопрос отображается в чате, но ответ не собирается
- [ ] Прогресс в Header: 9/10 → 10/10 при завершении
- [ ] Все тесты проходят
- [ ] typecheck без ошибок

---

## Приоритеты

| Элемент | Приоритет |
|---------|-----------|
| BottomSheet компонент (drag + toggle) | **High** |
| SummaryView (дизайн из прототипа) | **High** |
| Логика 9/10 вопросов | **High** |
| Интеграция в ChatWindow | **High** |
| Анимации | **Medium** |
| Тесты | **Medium** |

---

## Прототип

Файл прототипа: `docs/design/summary-view.html`
