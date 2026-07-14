# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation is a Dockerized FastAPI + Next.js app with real signup/signin authentication (JWT in an HttpOnly cookie, bcrypt-hashed passwords) gating a dashboard that links into a single AI chat interface covering all 11 document types from catalog.json, plus a My Documents screen to resume drafts or revisit completed documents. See Implementation Status below.

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

### Completed (PL-7)
- Real user authentication replacing the fake `/login` screen: `backend/app/auth/` (`security.py` for bcrypt hashing + JWT issuing/verification, `deps.py` for the `get_current_user` FastAPI dependency, `router.py` for `POST /api/auth/signup|signin|signout` and `GET /api/auth/me`). Session state is a JWT in an HttpOnly, SameSite=Lax cookie (`JWT_SECRET_KEY` in `.env`, 7-day expiry) rather than a bearer token in localStorage, since the frontend is same-origin static export served by this API
- New `users` and `documents` tables, created inside `db.reset_database()` on every startup alongside the existing wipe-and-recreate behavior (still fully ephemeral across restarts, per this ticket's explicit scope)
- Document persistence (`backend/app/documents.py`, `documents_router.py`): a `documents` row is created once the chat's intake step classifies a document type, then updated on every subsequent turn — covering both in-progress drafts (`is_complete=False`) and finished documents in one table. `POST /api/chat` gained a `document_id` field (nullable) and now requires authentication; `GET/DELETE /api/documents/{id}` and `GET /api/documents` are scoped to the requesting user, returning 404 (not 403) for another user's document to avoid confirming it exists
- Frontend auth gating is client-side only (`frontend/app/dashboard/layout.tsx` calls `GET /api/auth/me` on mount and redirects to `/login/` if unauthenticated), since the static export (`output: "export"`) supports no middleware, no server actions, and no `next/headers` cookie access — this is the same SPA-style pattern Next's own docs recommend for static exports
- New `/signup` page; `/login` now actually calls the auth endpoints instead of navigating unconditionally
- New My Documents screen (`/dashboard/documents`): card grid listing a user's documents with status (Draft/Complete), "Continue"/"View" linking to `/dashboard/draft/?id=N` to resume the chat or revisit the finished document, and delete (with an inline, non-modal confirmation rather than a native `confirm()` dialog)
- `/dashboard/draft` resumes a saved document via `?id=`, hydrating `DraftChat`'s transcript and the extracted fields from `GET /api/documents/{id}`; the page content is keyed by that id so navigating to a different document (or to a fresh one) fully remounts the chat instead of carrying over stale state
- Visual redesign: a persistent navy sidebar (`frontend/components/Sidebar.tsx`) replaces the copy-pasted per-page header, using the previously-unused `brand-yellow` token to mark the active nav item; a serif display face (`Source Serif 4`) is applied to document preview headings only, keeping "paper" content visually distinct from the sans-serif app chrome
- Legal disclaimer ("AI-generated draft ... must be reviewed by a qualified attorney") added as both plain footer text and a rotated translucent "DRAFT" stamp, on the on-screen preview (`DocumentPreview.tsx`) and in the downloaded PDF (`DocumentPdfDocument.tsx`)

### Current API Endpoints
- `GET /api/health` - Health check (also verifies SQLite connectivity)
- `POST /api/auth/signup` / `POST /api/auth/signin` / `POST /api/auth/signout` / `GET /api/auth/me` - Signup, signin, signout, and current-user lookup (see PL-7 above)
- `POST /api/chat` - One turn of the document drafting chat, covering intake (document-type matching) and field-gathering for all 11 document types (see PL-6 above); requires authentication and persists/updates a `documents` row once a document type is known (see PL-7 above)
- `GET /api/documents` / `GET /api/documents/{id}` / `DELETE /api/documents/{id}` - List, fetch, and delete the current user's drafted documents (see PL-7 above)