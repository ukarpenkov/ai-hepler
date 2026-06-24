# Final Deployment — Backend + Frontend on Cloud Run

**Date:** 2026-06-21
**Status:** ✅ Successful

---

## URLs

| Service | URL |
|---------|-----|
| **Backend** | https://interview-sim-606232140580.us-central1.run.app |
| **Frontend** | https://interview-sim-frontend-606232140580.us-central1.run.app |

## Deployment Parameters

### Backend

| Parameter | Value |
|-----------|-------|
| Service | interview-sim |
| Project | project-045dea81-cef3-4b7e-a28 |
| Region | us-central1 |
| Port | 3001 |
| Memory | 512Mi |
| CPU | 1 |
| Secrets | DEEPSEEK_API_KEY |

### Frontend

| Parameter | Value |
|-----------|-------|
| Service | interview-sim-frontend |
| Project | project-045dea81-cef3-4b7e-a28 |
| Region | us-central1 |
| Port | 3000 |
| Memory | 512Mi |
| CPU | 1 |

## Smoke Test

### Backend

```
POST /job/parse
{
  "text": "Frontend developer React TypeScript 3 years experience"
}

Response:
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

### Frontend

```
GET /
Response: HTML page
```

**Status:** ✅ Pass

## Fixes

- Removed `COPY --from=builder /app/public ./public` from frontend Dockerfile (directory `public` does not exist)
- Added `.dockerignore` for frontend

## Files

- `docs/deployment/backend-url.txt` — backend URL
- `docs/deployment/frontend-url.txt` — frontend URL
- `docs/reports/2026-06-21-phase6-deploy.md` — backend deployment report
- `docs/reports/2026-06-21-phase6-final-deployment.md` — this report
- `README.md` — updated with deployment URLs
