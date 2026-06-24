# Backend Deployment to Cloud Run

**Date:** 2026-06-21
**Status:** ✅ Successful

---

## Service URL

```
https://interview-sim-606232140580.us-central1.run.app
```

## Deployment Parameters

| Parameter | Value |
|-----------|-------|
| Project | `project-045dea81-cef3-4b7e-a28` |
| Region | `us-central1` |
| Platform | Managed |
| Port | 3001 |
| Memory | 512Mi |
| CPU | 1 |
| Max instances | 10 |
| Auth | Unauthenticated |

## Secrets

| Secret | Env Variable |
|--------|-------------|
| `deepseek-api-key` | `DEEPSEEK_API_KEY` |

Redis is not used (in-memory sessions).

## Smoke Test

**Request:**
```json
POST /job/parse
{
  "text": "Frontend developer React TypeScript 3 years experience"
}
```

**Response:**
```json
{
  "sessionId": "a6155c51-1550-4a26-ab63-72f3f7d1c7b3",
  "jobProfile": {
    "role": "Frontend developer",
    "level": "middle",
    "skills": ["React", "TypeScript"],
    "keywords": ["frontend", "React", "TypeScript", "3 years experience"],
    "domain": "Technology"
  }
}
```

**Status:** ✅ Pass

## Files

- URL saved in `docs/deployment/backend-url.txt`
- Dockerfile — multi-stage build (builder + runtime)
- Secrets management via Google Cloud Secret Manager
