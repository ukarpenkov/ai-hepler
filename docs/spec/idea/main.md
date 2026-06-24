# AI Job-Based Interview Simulator

The user uploads a job description — the system automatically builds a personalized interview tailored specifically for that position.

---

## How It Works

### 1. User Input

Job description text (LinkedIn / HH / PDF / copy-paste)

### 2. System Analyzes the Job

Extracts:

- skills
- tech stack
- level (junior / middle / senior)
- role type (backend / frontend / data / etc.)
- key requirements

### 3. "Smart Interview" Begins

System:

- generates questions specifically for the job
- simulates the interview
- evaluates answers
- adapts difficulty

---

## Agent Architecture (ADK core)

### 1. Job Parsing Agent

**Role:** job analysis, requirement structuring

**Output:**

```json
{
  "role": "Backend Engineer",
  "level": "Middle",
  "skills": ["Node.js", "SQL", "System Design"],
  "keywords": ["scalability", "APIs", "microservices"]
}
```

### 2. Interviewer Agent

**Role:** generates questions only for the job, applies difficulty progression

**Example:**
- "Explain REST API design"
- "How would you scale this system?"
- "SQL query optimization"

### 3. Evaluator Agent

**Role:** evaluates answers, provides structured feedback

```json
{
  "score": 6,
  "strengths": ["good structure"],
  "weaknesses": ["missing scaling considerations"],
  "recommendation": "study caching strategies"
}
```

### 4. Coach Agent

**Role:** explains the correct answer, teaches how to answer better specifically for this job

### 5. Memory Agent

**Role:** stores weak skills relative to job requirements

**Example:**
- "weak in system design"
- "weak in SQL optimization"

Affects subsequent questions.

---

## Tools / MCP (per requirements)

Required tools:

- `parse_job_description()`
- `generate_question(job_profile)`
- `evaluate_answer()`
- `update_user_memory()`
- `retrieve_weak_areas()`

---

## Multi-agent flow (key requirement)

```
Job Description
    |
    v
Job Parsing Agent
    |
    v
Interviewer Agent --> question
    |
    v
User Answer
    |
    v
Evaluator Agent
    |
    v
Coach Agent
    |
    v
Memory Agent update
    |
    v
Next Question (adaptive)
```
