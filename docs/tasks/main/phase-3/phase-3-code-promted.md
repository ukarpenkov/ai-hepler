# Phase 2 — Prompts for Implementation (Frontend)

---

## Step 1 — Initialize Next.js project ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Create a Next.js project for the AI Interview Simulator frontend.

Actions:
1. In the project root (ai-interview-simulator/) run: npx create-next-app@latest packages/web --typescript --tailwind --app --no-eslint --no-src-dir --import-alias "@/*"
2. Verify that packages/web/ was created with app/ directory structure
3. In packages/web/app/layout.tsx — basic layout with html and body
4. In packages/web/app/page.tsx — empty placeholder page "AI Interview Simulator"
5. In packages/web/package.json add script "dev": "next dev -p 3000"
6. Run npm install in packages/web/

Test: cd packages/web && npx next lint (should pass without errors)
```

---

## Step 2 — API client configuration (lib/api.ts) ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Create an API client for the frontend.

File: packages/web/lib/api.ts

Requirements:
1. Constant API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
2. Function parseJob(text: string): Promise<{ sessionId: string, jobProfile: ParsedJob }>
   - POST /job/parse with body { text }
3. Function startInterview(sessionId: string): Promise<{ question: QuestionResult }>
   - POST /interview/start with body { sessionId }
4. Function sendAnswer(sessionId: string, answer: string): Promise<{ evaluation, coach, memory, nextQuestion }>
   - POST /interview/answer with body { sessionId, answer }
5. Function getSession(id: string): Promise<SessionData>
   - GET /session/:id
6. Types: ParsedJob, QuestionResult, EvaluationResult, CoachResult, MemoryUpdate, SessionData
   - Define them in packages/web/lib/types.ts
7. Error handling: check response.ok, throw Error with message from JSON

File: packages/web/lib/types.ts
- Export all interfaces: ParsedJob, QuestionResult, EvaluationResult, CoachResult, MemoryUpdate, SessionData

Test: packages/web/__tests__/api.test.ts
- mock fetch
- test parseJob calls POST /job/parse
- test startInterview calls POST /interview/start
- test sendAnswer calls POST /interview/answer
- test getSession calls GET /session/:id
- test HTTP error handling
```

---

## Step 3 — JobUpload component (job input) ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Create a JobUpload component for entering job description text.

File: packages/web/components/JobUpload.tsx

Requirements:
1. React component with props: { onSubmit: (text: string) => void, isLoading: boolean }
2. Textarea with placeholder "Paste job description text..."
3. Button "Start interview"
4. Validation: minimum 50 characters, otherwise show error
5. Design: Tailwind CSS, minimalist style
6. Button disabled while isLoading or text < 50 characters

File: packages/web/components/JobUpload.test.tsx
Test (use @testing-library/react and vitest):
- renders textarea and button
- button disabled when text is empty
- button enabled when text >= 50 characters
- calls onSubmit when button is clicked

Additional dependencies in packages/web/package.json (devDependencies): @testing-library/react, @testing-library/jest-dom, jsdom, vitest
Add vitest config in packages/web/vitest.config.ts
```

---

## Step 4 — MessageBubble component (message output) ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Create a MessageBubble component for displaying chat messages.

File: packages/web/components/MessageBubble.tsx

Requirements:
1. React component with props: { role: "user" | "assistant", content: string, timestamp?: string }
2. If role === "user" — message on the right, blue background
3. If role === "assistant" — message on the left, gray background
4. Display timestamp if provided
5. Tailwind CSS styles
6. Text content with line-height

File: packages/web/components/MessageBubble.test.tsx
Test:
- renders user message on the right
- renders assistant message on the left
- displays timestamp if provided
```

---

## Step 5 — FeedbackCard component (evaluation result) ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Create a FeedbackCard component for displaying answer evaluation results.

File: packages/web/components/FeedbackCard.tsx

Requirements:
1. React component with props: { evaluation: EvaluationResult, coach: CoachResult }
2. Display:
   - Score (1-10) with color indication (red < 4, yellow 4-6, green > 6)
   - Strengths (list)
   - Weaknesses (list)
   - Recommendation (text)
   - Coach explanation (text)
   - Improved answer (text in code block)
   - Tips (list)
3. Tailwind CSS, card with shadow
4. Import types from @/lib/types

File: packages/web/components/FeedbackCard.test.tsx
Test:
- renders score
- renders strengths and weaknesses
- renders coach explanation
- renders tips
```

---

## Step 6 — ChatWindow component (main chat interface) ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Create a ChatWindow component — main chat interface.

File: packages/web/components/ChatWindow.tsx

Requirements:
1. Props: { sessionId: string, initialQuestion: QuestionResult }
2. State: messages (array of { role, content }), currentInput, isLoading, lastFeedback (EvaluationResult | null), lastCoach (CoachResult | null)
3. On mount: add initialQuestion as first assistant message
4. Textarea + button "Send"
5. On send:
   - Add user message to messages
   - Call sendAnswer(sessionId, answer)
   - Add assistant message with next question text
   - Save evaluation and coach to lastFeedback/lastCoach
6. Below textarea show FeedbackCard if lastFeedback exists
7. Auto-scroll to bottom on new messages
8. Button disabled while isLoading
9. Use MessageBubble for rendering each message

Test: packages/web/components/ChatWindow.test.tsx
- mock sendAnswer
- renders initial question
- sending answer adds user message
- after answer FeedbackCard is displayed
```

---

## Step 7 — Main page (app/page.tsx) ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Create the application main page.

File: packages/web/app/page.tsx

Requirements:
1. Client Component ("use client")
2. State: jobText, isLoading, error, sessionId
3. On submit jobText:
   - Call parseJob(text) from lib/api
   - Save sessionId
   - Call startInterview(sessionId) to get first question
   - Redirect to /interview with parameters sessionId and initialQuestion
4. Use JobUpload component
5. If error — show message
6. Tailwind CSS: centered container, heading "AI Interview Simulator"

Test: packages/web/app/__tests__/page.test.tsx
- mock api functions
- renders heading
- renders JobUpload
```

---

## Step 8 — Interview page (app/interview/page.tsx) ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Create the interview page.

File: packages/web/app/interview/page.tsx

Requirements:
1. Client Component ("use client")
2. Read searchParams: sessionId, question, topic, difficulty
3. If no sessionId — redirect to /
4. Create QuestionResult object from searchParams
5. Render ChatWindow with sessionId and initialQuestion
6. Tailwind CSS: full screen height

File: packages/web/app/interview/layout.tsx
- Simple layout without navigation

Test: packages/web/app/interview/__tests__/page.test.tsx
- mock useSearchParams
- renders ChatWindow
```

---

## Step 9 — Layout and navigation (app/layout.tsx) ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Update the application root layout.

File: packages/web/app/layout.tsx

Requirements:
1. Metadata: title "AI Interview Simulator", description "Practice interviews with AI"
2. Inter font via next/font/google
3. Tailwind CSS globals: remove default styles, keep only basic reset
4. Body: min-height screen, bg-gray-50, text-gray-900

File: packages/web/app/globals.css
- Tailwind directives: @tailwind base, @tailwind components, @tailwind utilities
- Minimal global styles

Test: packages/web/app/__tests__/layout.test.tsx
- renders children
- contains title
```

---

## Step 10 — ProgressBar component (interview progress) ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Create a ProgressBar component for displaying interview progress.

File: packages/web/components/ProgressBar.tsx

Requirements:
1. Props: { current: number, total: number }
2. Visual progress bar (div with bg-blue-500, width in percent)
3. Text: "Question X of Y"
4. Tailwind CSS

File: packages/web/components/ProgressBar.test.tsx
- renders correct text
- bar width corresponds to percentage
```

---

## Step 11 — Integrate ProgressBar into ChatWindow ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Integrate ProgressBar into ChatWindow.

Update packages/web/components/ChatWindow.tsx:
1. Add state questionCount (initial = 1)
2. On each answer increment questionCount
3. Show ProgressBar above chat: current={questionCount}, total={10}
4. Import ProgressBar

Test: packages/web/components/ChatWindow.test.tsx (update)
- after sending answer questionCount increases
- ProgressBar displays current question number
```

---

## Step 12 — Styling and final Tailwind setup ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Finalize frontend styling.

Actions:
1. Verify that all components use Tailwind classes
2. Ensure responsive (mobile-friendly)
3. Add hover/focus states for buttons and textarea
4. Check that text is readable (font-size, contrast)
5. Check that scrolling works correctly in ChatWindow

File: packages/web/tailwind.config.ts
- Ensure content paths are correct

Test: cd packages/web && npx next build (should build without errors)
```

---

## Step 13 — Frontend environment configuration ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Configure frontend environment.

Files:
1. packages/web/.env.example:
   NEXT_PUBLIC_API_URL=http://localhost:3001

2. packages/web/.gitignore (add to root):
   - .next
   - out
   - packages/web/.next

3. Update packages/web/lib/api.ts:
   - API_BASE should read process.env.NEXT_PUBLIC_API_URL

4. Verify that build works with correct variables
```

---

## Step 14 — Fix imports and component connections ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Check and fix all frontend component connections.

Actions:
1. Verify that all import paths are correct (@/components/*, @/lib/*)
2. Verify that types are imported from @/lib/types
3. Verify that React Server Components and Client Components are properly separated
4. Ensure that "use client" is present on all components with useState/useEffect
5. Fix any import errors

Run:
- cd packages/web && npx tsc --noEmit
- cd packages/web && npx next lint

All must pass without errors.
```

---

## Step 15 — Final frontend verification ✅ Completed

**Status:** ✅ Completed

> **General rules (apply to EVERY step):**
> 1. Code language — TypeScript.
> 2. Do not add comments to code, except JSDoc where necessary.
> 3. Do not commit automatically — wait for confirmation.
> 4. After each step run `npm run typecheck`, `npm run lint`, `npm run test`. All three must pass.
> 5. File structure: `packages/web/` — frontend sources.
> 6. Use existing libraries, do not add new ones unless necessary.
> 7. No feature flags and backwards-compat shims — if you change, change directly.
> 8. After completing the step mark its status as "Completed" in the heading.
> 9. Before starting a new step check that the previous step is marked as "Completed".
> 10. After each step write a report to `docs/reports/` with name `<YYYY-MM-DD>-phase2-step-<N>.md`.

**Prompt:**

```
Perform final frontend verification:

1. Run cd packages/web && npx tsc --noEmit — fix all type errors
2. Run cd packages/web && npx next lint — fix all warnings and errors
3. Run cd packages/web && npx vitest run — ensure all tests pass
4. Run cd packages/web && npx next build — ensure build works
5. Verify file structure is complete:
   packages/web/app/page.tsx
   packages/web/app/layout.tsx
   packages/web/app/globals.css
   packages/web/app/interview/page.tsx
   packages/web/app/interview/layout.tsx
   packages/web/components/JobUpload.tsx
   packages/web/components/MessageBubble.tsx
   packages/web/components/FeedbackCard.tsx
   packages/web/components/ChatWindow.tsx
   packages/web/components/ProgressBar.tsx
   packages/web/lib/api.ts
   packages/web/lib/types.ts
6. Verify that .env.example contains NEXT_PUBLIC_API_URL

All commands must pass without errors.
```