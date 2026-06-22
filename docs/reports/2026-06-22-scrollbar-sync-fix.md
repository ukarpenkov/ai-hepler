# 2026-06-22 — Scrollbar Sync & Drag Fix

## Goal

Исправить кастомный скроллбар: синхронизировать позицию thumb с прокруткой контейнера и сделать thumb перетаскиваемым (drag-to-scroll).

## Problem

Два бага:

1. **Thumb не привязан к прокрутке** — при скролле позиция thumb не обновлялась, потому что трек скроллбара (`custom-scroll-track`) находился **внутри** скроллируемого контейнера (`scroll-overlay`). CSS `position: absolute` внутри overflow-контейнера не гарантировало фиксированную позицию — трек мог прокручиваться вместе с контентом.

2. **Thumb не перетаскивается** — в `CustomScrollbar` обработчики `onPointerDown/Move/Up` были на thumb, но в `JobInputForm` thumb был display-only (без обработчиков drag).

## Changes

### `components/CustomScrollbar.tsx`

- **Реструктуризация DOM**: добавлен wrapper `<div className="... relative">` вокруг скролл-контейнера и трека
- Скролл-контейнер теперь `scroll-overlay h-full overflow-y-auto` — отдельный от трека
- Трек (`custom-scroll-track`) теперь sibling скролл-контейнера, positioned relative к wrapper — **не скроллится с контентом**
- Новый проп `contentClassName` для стилей контента (padding, flex, gap)
- `className` теперь только для sizing (flex-1, min-h-0, h-full)

### `components/JobInputForm.tsx`

- Добавлены обработчики `handleThumbPointerDown`, `handleThumbPointerMove`, `handleThumbPointerUp` (аналогично `CustomScrollbar`)
- Thumb стал интерактивным: `setPointerCapture` для drag-to-scroll
- Курсор `grab`/`grabbing` на thumb

### `components/ChatWindow.tsx`

- `className="flex-1 min-h-0"` (sizing) + `contentClassName="p-[15px] sm:p-5 md:p-7 flex flex-col gap-4 sm:gap-5"` (content)

### `components/BottomSheet.tsx`

- `className="h-full"` вместо `className="h-full overflow-y-auto"` (overflow теперь внутри)

### `components/Sidebar.tsx`

- Аналогично BottomSheet: `className="h-full"`

## Architecture Fix

```
BEFORE (broken):
<div class="scroll-overlay" ref={containerRef}>  ← overflow container + track inside
  {children}
  <div class="custom-scroll-track">  ← scrolls with content!
    <div class="custom-scroll-thumb" />
  </div>
</div>

AFTER (fixed):
<div class="relative">  ← sizing wrapper
  <div class="scroll-overlay h-full overflow-y-auto" ref={containerRef}>  ← scroll only
    {children}
  </div>
  <div class="custom-scroll-track">  ← fixed, outside scroll container
    <div class="custom-scroll-thumb" />
  </div>
</div>
```

## Result

- typecheck: pass
- lint: pass
- tests: 158/158 pass
- Thumb корректно следует за прокруткой во всех компонентах: chat window, job input textarea, sidebar, bottom sheet
- Thumb доступен для drag-to-scroll через pointer events
