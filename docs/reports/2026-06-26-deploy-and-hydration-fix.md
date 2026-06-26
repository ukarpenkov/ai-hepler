# 2026-06-26 — Cloud Run Deploy + i18n Hydration Fix

## Goal

Deploy both services (backend API + frontend) to Google Cloud Run and fix hydration mismatch caused by i18n locale initialization.

## Problem

1. Backend Dockerfile ran `npm run build` which triggered Next.js build instead of TypeScript compilation — backend container failed to start.
2. `I18nProvider` read locale from `localStorage` in `useState` initial value. Server rendered with `"en"` (default), client hydrated with `"ru"` (stored) — React hydration mismatch error.

## Changes

### 1. `Dockerfile` — Fix backend build

Changed `RUN npm run build` → `RUN npx tsc`. The root `npm run build` resolves to Next.js in the monorepo context; `npx tsc` compiles only the TypeScript API.

### 2. `packages/web/lib/i18n-context.tsx` — Fix hydration mismatch

Replaced `readLocale()` (sync localStorage read in `useState`) with `useEffect`-based initialization. Both server and client now start with `"en"`, then client reads localStorage after mount and switches if needed.

### 3. `docs/release.md` — Deployment URLs

New file with Cloud Run service URLs for reference.

### 4. `deployment/terraform/` — Infrastructure as Code

New Terraform configs for Cloud Run deployment (scaffolded by `agents-cli`):

| File | Purpose |
|------|---------|
| `service.tf` | Cloud Run service definition |
| `iam.tf` | Service account + IAM bindings |
| `apis.tf` | GCP API enablement |
| `providers.tf` | Terraform provider config |
| `variables.tf` | Input variables |
| `outputs.tf` | Service URLs |
| `storage.tf` | Logs bucket |
| `telemetry.tf` | Cloud Logging sinks |

### 5. `app/` — Python agent scaffold

New `app/` directory with ADK agent boilerplate (created by `agents-cli scaffold enhance`):

| File | Purpose |
|------|---------|
| `app/__init__.py` | Package init |
| `app/agent.py` | Agent entry point |
| `app/fast_api_app.py` | FastAPI app |
| `app/app_utils/telemetry.py` | Telemetry utilities |
| `app/app_utils/typing.py` | Type definitions |

### 6. Supporting files

| File | Purpose |
|------|---------|
| `agents-cli-manifest.yaml` | agents-cli project manifest |
| `pyproject.toml` | Python project config |
| `GEMINI.md` | agents-cli coding guide |
| `tests/eval/` | Eval dataset + config |
| `tests/integration/` | Integration tests |
| `tests/unit/` | Unit tests |

## Deployment

Both services deployed to Cloud Run (us-central1):

| Service | URL | Status |
|---------|-----|--------|
| Backend API | https://interview-sim-606232140580.us-central1.run.app | 200 OK |
| Frontend UI | https://interview-sim-frontend-606232140580.us-central1.run.app | 200 OK |

## Verification

```bash
curl https://interview-sim-606232140580.us-central1.run.app/health
# → {"status":"ok"}

curl -o /dev/null -w "%{http_code}" https://interview-sim-frontend-606232140580.us-central1.run.app/
# → 200
```

## Files changed (29 total)

| File | Change |
|------|--------|
| `Dockerfile` | Fix: `npm run build` → `npx tsc` |
| `packages/web/lib/i18n-context.tsx` | Fix: hydration mismatch via useEffect |
| `docs/release.md` | **New** — deployment URLs |
| `deployment/terraform/single-project/service.tf` | **New** — Cloud Run service |
| `deployment/terraform/single-project/iam.tf` | **New** — IAM bindings |
| `deployment/terraform/single-project/apis.tf` | **New** — API enablement |
| `deployment/terraform/single-project/providers.tf` | **New** — provider config |
| `deployment/terraform/single-project/variables.tf` | **New** — variables |
| `deployment/terraform/single-project/outputs.tf` | **New** — outputs |
| `deployment/terraform/single-project/storage.tf` | **New** — storage |
| `deployment/terraform/single-project/telemetry.tf` | **New** — telemetry |
| `deployment/terraform/single-project/telemetry_outputs.tf` | **New** — telemetry outputs |
| `deployment/terraform/single-project/service_outputs.tf` | **New** — service outputs |
| `deployment/terraform/single-project/vars/env.tfvars` | **New** — env vars |
| `deployment/terraform/shared/completions.sql` | **New** — SQL query |
| `deployment/terraform/shared/genai_logs_schema.json` | **New** — log schema |
| `app/__init__.py` | **New** — Python package |
| `app/agent.py` | **New** — agent entry |
| `app/fast_api_app.py` | **New** — FastAPI app |
| `app/app_utils/telemetry.py` | **New** — telemetry |
| `app/app_utils/typing.py` | **New** — types |
| `agents-cli-manifest.yaml` | **New** — manifest |
| `pyproject.toml` | **New** — Python config |
| `GEMINI.md` | **New** — coding guide |
| `tests/eval/datasets/README.md` | **New** — eval docs |
| `tests/eval/datasets/basic-dataset.json` | **New** — eval dataset |
| `tests/eval/eval_config.yaml` | **New** — eval config |
| `tests/integration/test_agent.py` | **New** — integration test |
| `tests/integration/test_server_e2e.py` | **New** — e2e test |
