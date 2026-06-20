# AI Job-Based Interview Simulator

Пользователь загружает текст вакансии — система автоматически строит персонализированное собеседование именно под эту вакансию.

---

## Как это работает

### 1. Пользователь вводит

Текст вакансии (LinkedIn / HH / PDF / copy-paste)

### 2. Система анализирует вакансию

Выделяет:

- навыки (skills)
- технологии (tech stack)
- уровень (junior / middle / senior)
- тип роли (backend / frontend / data / etc.)
- ключевые требования

### 3. Начинается "умный собес"

Система:

- генерирует вопросы именно под вакансию
- симулирует интервью
- оценивает ответы
- адаптирует сложность

---

## Архитектура агентов (ADK core)

### 1. Job Parsing Agent

**Роль:** анализ вакансии, структурирование требований

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

**Роль:** генерирует вопросы только по вакансии, делает прогрессию сложности

**Пример:**
- "Explain REST API design"
- "How would you scale this system?"
- "SQL query optimization"

### 3. Evaluator Agent

**Роль:** оценивает ответы, даёт структурированный фидбек

```json
{
  "score": 6,
  "strengths": ["good structure"],
  "weaknesses": ["missing scaling considerations"],
  "recommendation": "study caching strategies"
}
```

### 4. Coach Agent

**Роль:** объясняет правильный ответ, учит как отвечать лучше именно под эту вакансию

### 5. Memory Agent

**Роль:** хранит слабые навыки относительно вакансий

**Пример:**
- "weak in system design"
- "weak in SQL optimization"

Влияет на следующие вопросы.

---

## Tools / MCP (по требованиям ТЗ)

Обязательные tools:

- `parse_job_description()`
- `generate_question(job_profile)`
- `evaluate_answer()`
- `update_user_memory()`
- `retrieve_weak_areas()`

---

## Multi-agent flow (ключ ТЗ)

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
