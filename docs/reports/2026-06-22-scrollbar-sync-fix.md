# 2026-06-22 — Scrollbar Sync & Drag Fix

## Goal

Fix the custom scrollbar: sync thumb position with container scrolling and make thumb draggable (drag-to-scroll).

## Problem

Two bugs:

1. **Thumb not synced to scroll** — on scroll, thumb position wasn't updating because the scrollbar track (`custom-scroll-track`) was **inside** the scrollable container (`scroll-overlay`). CSS `position: absolute` inside an overflow container didn't guarantee a fixed position — the track could scroll with the content.

2. **Thumb not draggable** — in `CustomScrollbar`, `onPointerDown/Move/Up` handlers were on the thumb, but in `JobInputForm` the thumb was display-only (no drag handlers).

## Changes

### `components/CustomScrollbar.tsx`

- **DOM restructure**: added wrapper `<div className="... relative">` around scroll container and track
- Scroll container is now `scroll-overlay h-full overflow-y-auto` — separate from track
- Track (`custom-scroll-track`) is now a sibling of scroll container, positioned relative to wrapper — **does not scroll with content**
- New `contentClassName` prop for content styles (padding, flex, gap)
- `className` now only for sizing (flex-1, min-h-0, h-full)

### `components/JobInputForm.tsx`

- Added `handleThumbPointerDown`, `handleThumbPointerMove`, `handleThumbPointerUp` handlers (similar to `CustomScrollbar`)
- Thumb became interactive: `setPointerCapture` for drag-to-scroll
- Cursor `grab`/`grabbing` on thumb

### `components/ChatWindow.tsx`

- `className="flex-1 min-h-0"` (sizing) + `contentClassName="p-[15px] sm:p-5 md:p-7 flex flex-col gap-4 sm:gap-5"` (content)

### `components/BottomSheet.tsx`

- `className="h-full"` instead of `className="h-full overflow-y-auto"` (overflow now inside)

### `components/Sidebar.tsx`

- Similar to BottomSheet: `className="h-full"`

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
- Thumb correctly follows scroll in all components: chat window, job input textarea, sidebar, bottom sheet
- Thumb is interactive for drag-to-scroll via pointer events