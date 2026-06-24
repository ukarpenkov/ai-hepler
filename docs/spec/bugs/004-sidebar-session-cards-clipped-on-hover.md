# Bug: Session cards clipped on hover in sidebar

**Date:** 2026-06-24
**Priority:** Low
**Status:** Fixed
**Component:** Frontend — `Sidebar.tsx`

## Description

When hovering over a session card in the sidebar, the hover effect (`translate-x-1.5` + `shadow`) extended beyond the sidebar container and was clipped.

## Expected Behavior

The hover effect on session cards should be fully visible without being cut off at the sidebar edge.

## Actual Behavior

- Cards on `hover` shifted right (`translate-x-1.5`) and received a shadow (`shadow-lg`)
- Sidebar had `px-5` (20px) internal padding
- The combination of card padding (`p-3.5 px-4`) + hover shift + shadow exceeded the available space
- The right part of the hover effect was clipped by the sidebar border

## Reproduction

1. Open the app with session history
2. Hover over a session card in the sidebar
3. **Observation:** the right part of the card with shadow is clipped

## Screenshot

![Bug screenshot](bug-sidebar-cards-clipped.png)

## Fix

**`packages/web/components/Sidebar.tsx`:**

| Parameter | Before | After |
|-----------|--------|-------|
| Sidebar padding | `px-5` (20px) | `px-3` (12px) |
| Card padding | `p-3.5 px-4` | `p-3 px-3.5` |
| Hover translate | `translate-x-1.5` (6px) | `translate-x-1` (4px) |

Increased free space by reducing sidebar and card padding, as well as reducing the hover shift amount.
