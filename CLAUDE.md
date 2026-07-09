# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation is a Dockerized FastAPI + Next.js app with a fake login screen (no real authentication yet) gating a dashboard that links into a single AI chat interface covering all 11 document types from catalog.json. Real authentication and document persistence are not yet built — see Implementation Status below.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
The frontend is statically exported (`next.config.ts` sets `output: "export"`) and served directly by FastAPI via `StaticFiles`.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed (PL-3)
- Mutual NDA Creator prototype: manual form with live preview and PDF download, at the frontend root route `/`

### Completed (PL-4)
- Docker multi-stage build (Node frontend build stage + Python/uv backend runtime stage)
- FastAPI backend with a SQLite DB file that is deleted and recreated fresh on every server startup (no tables yet — this ticket had no real auth)
- Next.js static export (`output: "export"`) served directly by FastAPI at http://localhost:8000
- Start/stop scripts for Mac, Linux, and Windows, wrapping `docker compose`
- Fake `/login` screen (no validation, no backend call) gating a placeholder `/dashboard` page — real authentication is not implemented yet
- `.env.example` added so `docker compose` works on a clean checkout
- Fixed a spurious hydration-mismatch console warning on the root layout caused by browser extensions (e.g. Grammarly) injecting attributes into `<body>`
- The Mutual NDA prototype at `/` is unchanged and not yet linked into the login/dashboard flow

### Completed (PL-5)
- AI chat interface for drafting a Mutual NDA, at `/dashboard/nda`, linked from a "New Mutual NDA" button on `/dashboard`
- Backend `POST /api/nda/chat` endpoint (`backend/app/nda_chat.py`, `backend/app/schemas.py`): one LiteLLM/OpenRouter/Cerebras structured-output call per turn returns the assistant's next message, extracted NDA field updates, and a completion flag; stateless per request (frontend resends full conversation history + current fields each turn, no persistence)
- The old manual-form prototype (`MndaForm.tsx`) is deleted; the root route `/` now redirects to `/login/`
- The live preview and PDF download (`MndaPreview.tsx`, `MndaPdfDocument.tsx`, `mnda-content.ts`) are reused unchanged, now driven by chat-extracted fields instead of form input

### Completed (PL-6)
- AI chat support for all 11 document types from catalog.json, replacing the NDA-only chat with a single conversational entry point at `/dashboard/draft`, linked from a generic "Start a new document" button on `/dashboard`
- Document selection is conversational, not a catalog grid: the user describes what they need in free text; the backend's intake classifier (`backend/app/chat/intake.py`) matches it to one of the 11 catalog documents, or explains it can't generate an unsupported request and suggests the closest match — no page navigation between "figuring out what you want" and "filling in fields"
- Backend replaces the single NDA-specific `nda_chat.py` with a generic, document-agnostic chat engine (`backend/app/chat/engine.py`) driven by a declarative field spec per document (`backend/app/chat/specs/*.py`, one per catalog entry, hand-authored by reading each template since only the Mutual NDA has a companion cover-page file). One shared `POST /api/chat` endpoint replaces `/api/nda/chat`; fields travel as a flat string-keyed dict (not a typed model per document) since the 11 document types have very different field shapes (5 to 34 fields)
- Frontend replaces the NDA-specific `mnda-content.ts`/`MndaPreview.tsx`/`MndaPdfDocument.tsx` with 11 bespoke content modules (`frontend/lib/documents/*.ts`, hand-transcribed prose per document matching each template) implementing a shared `DocumentContent<T>` interface, rendered by one generic `DocumentPreview`/`DocumentPdfDocument` component pair instead of one hand-authored pair per document
- DPA and AI Addendum (contract riders whose text assumes a parent agreement already exists) are offered as standalone documents like the other 9, with no cross-document linking (document persistence doesn't exist yet — that's PL-7)
- CSA/PSA/Software License Agreement's Order Form fee/line-item structures are captured as free-text summary fields in this round, not structured repeating line items — a deliberate scope boundary

### Not started (planned)
- **PL-7**: Real user authentication (JWT in HttpOnly cookies, bcrypt-hashed passwords, signup/signin/signout), document persistence, and a My Documents UI

### Current API Endpoints
- `GET /api/health` - Health check (also verifies SQLite connectivity)
- `POST /api/chat` - One turn of the document drafting chat, covering intake (document-type matching) and field-gathering for all 11 document types (see PL-6 above)