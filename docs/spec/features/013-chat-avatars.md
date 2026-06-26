# Feature: Chat Avatars — Optimized Interviewer & Candidate Images

**Date:** 2026-06-27
**Priority:** Low
**Status:** Done
**Component:** Frontend — Chat UI

---

## Description

Replace placeholder gradient circles in the interview chat with character avatars for the interviewer (AI) and the candidate (user). Source images are large PNG portraits (~2 MB each) with a circular crop on a black square background. They are optimized into lightweight WebP assets sized for the 40×40 px avatar slot and wired into all chat message surfaces.

---

## Current Behavior (before changes)

- `MessageBubble` renders empty gradient circles:
  - **assistant** — primary → pink gradient
  - **user** — emerald gradient
- `TypingIndicator` uses the same empty assistant gradient circle
- No visual identity for chat participants

---

## Expected Behavior

### 1. Interviewer avatar (assistant role)

- Display a circular portrait of the "boss cat" (business attire)
- Shown on the left for AI questions and on the typing indicator

### 2. Candidate avatar (user role)

- Display a circular portrait of the "candidate cat" (hoodie + glasses)
- Shown on the right for user answers

### 3. Visual quality & performance

- Avatars appear crisp inside a circle (`rounded-full`, `object-cover`)
- Subtle shadow and ring for separation from the chat background
- Total asset weight ≈ **6 KB** (both files combined), suitable for static serving without a runtime image pipeline

---

## What Was Done

### 1. Asset optimization

Source files (user-provided):

| Source | Role | Output |
|--------|------|--------|
| `boss.png` | Interviewer (assistant) | `packages/web/public/avatars/interviewer.webp` |
| `cat.png` | Candidate (user) | `packages/web/public/avatars/candidate.webp` |

Processing pipeline (`packages/web/scripts/optimize-avatars.mjs`):

1. Resize to **96×96** px (`fit: cover`, centred) — 2× density for a 40 px display slot
2. Apply circular alpha mask (SVG `dest-in` composite)
3. Export as **WebP** (`quality: 82`, `effort: 6`)

Result:

| File | Original size | Optimized size |
|------|---------------|----------------|
| `interviewer.webp` | ~2.1 MB | ~3 KB |
| `candidate.webp` | ~2.0 MB | ~2.9 KB |

### 2. `ChatAvatar` component

**New file:** `packages/web/components/ChatAvatar.tsx`

- Maps `role: "user" | "assistant"` → static WebP path in `/public/avatars/`
- Uses a plain `<img>` (not `next/image`) — assets are pre-optimized; avoids build-time image processing
- Shared styling: `w-10 h-10 rounded-full object-cover shrink-0 shadow ring-1 ring-black/5`

### 3. Integration

| Component | Change |
|-----------|--------|
| `MessageBubble.tsx` | Gradient circle replaced with `<ChatAvatar role={role} />` |
| `TypingIndicator.tsx` | Gradient circle replaced with `<ChatAvatar role="assistant" />` |

---

## Architecture

```
public/avatars/
  ├── interviewer.webp   → assistant / typing indicator
  └── candidate.webp     → user messages

ChatWindow
  ├── MessageBubble (role: user | assistant)
  │     └── ChatAvatar
  └── TypingIndicator
        └── ChatAvatar (assistant)
```

---

## Re-generating Avatars

`sharp` is **not** a project dependency. To regenerate after replacing source PNGs:

```powershell
cd packages/web
npm install --no-save sharp
node scripts/optimize-avatars.mjs
npm uninstall sharp
```

Update input paths in `scripts/optimize-avatars.mjs` if source files move.

---

## Design Notes

- **Format:** WebP — best size/quality ratio for small circular portraits
- **Display size:** 40×40 px (`w-10 h-10`); source at 96×96 for retina
- **Accessibility:** `alt="Interviewer"` / `alt="Candidate"`
- **No emoji fallback** — images are static assets bundled with the app

---

## Related Files

| File | Action |
|------|--------|
| `packages/web/public/avatars/interviewer.webp` | Added — optimized interviewer avatar |
| `packages/web/public/avatars/candidate.webp` | Added — optimized candidate avatar |
| `packages/web/components/ChatAvatar.tsx` | Added — shared avatar component |
| `packages/web/components/MessageBubble.tsx` | Updated — use `ChatAvatar` |
| `packages/web/components/TypingIndicator.tsx` | Updated — use `ChatAvatar` |
| `packages/web/scripts/optimize-avatars.mjs` | Added — one-off asset build script |

---

## Acceptance Criteria

- [x] Interviewer avatar shown for assistant messages (left side)
- [x] Candidate avatar shown for user messages (right side)
- [x] Interviewer avatar shown in typing indicator
- [x] Avatars render as clean circles (no black corner artifacts)
- [x] Combined asset size under 10 KB
- [x] `MessageBubble` tests pass
- [x] No new runtime dependencies added to the app
