# 2026-06-23 — Update Browser Favicon

## Goal

Replace the default browser icon (favicon) with the project's custom logo `packages/asset/logo.ico`.

## Problem

The favicon in the Next.js app was default — `packages/web/app/favicon.ico` contained the default file. Need to display the project's branded logo (interview icon) in the browser tab.

## Changes

### `packages/web/app/favicon.ico`

- Replaced with content from `packages/asset/logo.ico`
- Icon: blue circular icon with interview silhouette (chat with person)
- Next.js App Router automatically picks up `app/favicon.ico` as browser icon

## Result

- Project branded logo displays in browser tab
- No additional configuration needed — App Router convention