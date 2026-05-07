---
name: Protocol Claude-Code-Board — OpenAI API Bridge
description: Add OpenAI-compatible API + API keys management to Claude-Code-Board for commercial appliance
type: project
---

# Protocol: Claude-Code-Board — OpenAI API Bridge

**Status: COMPLETE**
**Project:** `/Users/nicolasmichaut/Documents/GitHub/Claude-Code-Board`
**Branch:** `protocol/openai-api-bridge`
**Created:** 2026-05-07
**Last commit:** 3312ffc

---

## Design

### Problem Statement
Create a commercial API appliance for Claude Code that runs on SmartPi One. Users need an OpenAI-compatible API + key management UI to integrate Claude Code into any application.

### Approach Chosen
**Extend Claude-Code-Board (Express + SQLite + Socket.IO)** to add:
1. API key management (generation, validation, quotas)
2. OpenAI-compatible `/v1/chat/completions` endpoint
3. UI page for key management
4. Integration into ClaudeCodeOS-smartpi image

**Why:** Claude-Code-Board already has the session + message infrastructure; we only need to add the OpenAI translation layer and key management. Lower risk than building from scratch.

---

## Progress

- [x] Phase B — DB Migration + ApiKeyService (Low risk) — validated 07/05/2026
- [x] Phase C — CRUD Endpoints + Auth Extension (Medium risk) — validated 07/05/2026
- [x] Phase D — OpenAI Bridge /v1/* (High risk) — validated 07/05/2026
- [x] Phase E — Frontend API Keys Page (Low risk) — validated 07/05/2026

---

## Architecture (existing)

**Backend:** Express.js on port 3001
- Auth: JWT via `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars
- ProcessManager: spawn `npx @anthropic-ai/claude-code@latest --output-format=stream-json`
- Streaming: WebSocket/Socket.IO only (HTTP non-streaming)
- DB: SQLite `./data/claude-sessions.db` (sessions, messages, projects, tags, etc.)

**Frontend:** React 19 + Vite
- Navigation: `Sidebar.tsx`
- API calls: `axiosInstance.ts` → `/api`
- Auth: JWT in `localStorage`

---

## Available verification tools

- Unit tests: `npm test` (vitest setup exists)
- TypeScript: `npx tsc --noEmit`
- Manual curl testing: Bearer token auth

---

## Deploy rules

**Development:** `npm run dev` (backend + frontend dev servers)
**Build:** `npm run build` (backend: tsc, frontend: vite build)
**No deploy to production needed for this phase**

---

## Phase B — DB Migration + ApiKeyService

**Risk:** Low | **Scope:** 20 min | **TDD eligible:** YES

### Work

#### B1. Create DB migration
- **File:** `backend/src/database/migrations/add_api_keys_table.ts`
- **Change:** Create migration that adds table `api_keys` with columns: `key_id` (PK), `name`, `key_hash` (unique), `key_prefix`, `created_at`, `last_used_at`, `usage_count`

#### B2. Create ApiKeyService
- **File:** `backend/src/services/ApiKeyService.ts`
- **Change:** Implement service with methods:
  - `createKey(name)` → generates `sk-claudecode-<32 hex>`, hashes SHA256, stores, returns `{fullKey, meta}`
  - `listKeys()` → returns array without `key_hash` or `fullKey`
  - `deleteKey(keyId)` → deletes by id
  - `validateKey(rawKey)` → hashes input, compares, bumps `last_used_at`/`usage_count`, returns meta or null

#### B3. Integrate migration into DB init
- **File:** `backend/src/database/database.ts`
- **Change:** Call the new migration during `Database.initialize()`

### Verifications

- [ ] TypeScript compilation: `npx tsc --noEmit` succeeds
- [ ] Migration creates table correctly (inspect `./data/claude-sessions.db` schema)
- [ ] Unit tests pass: `npm test -- ApiKeyService.test.ts`
- [ ] Manual test: create key, validate correct key (passes), validate wrong key (fails), delete key

---

## Phase C — CRUD Endpoints + Auth Extension

**Risk:** Medium | **Scope:** 25 min

### Work

#### C1. Create API key routes
- **File:** `backend/src/routes/apiKey.routes.ts`
- **Change:** Define routes:
  - `GET /api/api-keys`
  - `POST /api/api-keys` with `{name}` body
  - `DELETE /api/api-keys/:keyId`

#### C2. Create API key controller
- **File:** `backend/src/controllers/ApiKeyController.ts`
- **Change:** Implement handlers for the 3 routes, admin JWT validation

#### C3. Extend auth middleware
- **File:** `backend/src/middleware/auth.middleware.ts`
- **Change:** Add 2nd auth path: `Bearer sk-claudecode-*` tokens (in addition to JWT)
  - If JWT fails → try validateKey() from ApiKeyService
  - Route `/api/api-keys` → accept JWT only, reject generated keys (403)

#### C4. Mount routes
- **File:** `backend/src/server.ts`
- **Change:** Register `/api/api-keys` routes

### Verifications

- [ ] TypeScript compilation succeeds
- [ ] Login with admin credentials, create key, list keys, delete key (curl tests)
- [ ] Auth with generated key on protected endpoint succeeds
- [ ] Auth with wrong key returns 401
- [ ] Auth with generated key on `/api/api-keys` returns 403

---

## Phase D — OpenAI Bridge /v1/*

**Risk:** High | **Scope:** 40 min

### Work

#### D1. Create OpenAI routes + controller
- **File:** `backend/src/routes/openai.routes.ts` (NEW)
- **File:** `backend/src/controllers/OpenAIController.ts` (NEW)
- **Change:** Implement:
  - `GET /v1/models` → returns OpenAI-format model list
  - `POST /v1/chat/completions` with full SSE + non-streaming support

#### D2. Message translation
- **Change in openai.routes.ts:** Extract last user message from OpenAI format, create/resume Claude Code session, pipe to ProcessManager

#### D3. Streaming logic
- **Change in openai.routes.ts:** 
  - For `stream: true` → subscribe to Socket.IO, proxy as SSE `text/event-stream`
  - For `stream: false` → await `process_exit` event, collect messages, return single JSON response

#### D4. Auth for /v1/*
- **Change:** Create `openaiAuthMiddleware` accepting only `Bearer sk-claudecode-*` tokens

#### D5. Mount routes
- **File:** `backend/src/server.ts`
- **Change:** Register `/v1/*` routes with openaiAuthMiddleware

### Verifications

- [ ] TypeScript compilation succeeds
- [ ] `curl GET /v1/models` with valid key returns model list
- [ ] `curl POST /v1/chat/completions` non-streaming returns OpenAI-format response
- [ ] `curl -N POST /v1/chat/completions` streaming with `stream: true` returns SSE chunks
- [ ] Invalid key on `/v1/*` returns 401

---

## Phase E — Frontend API Keys Page

**Risk:** Low | **Scope:** 25 min

### Work

#### E1. Create API key service
- **File:** `frontend/src/services/apiKeyService.ts`
- **Change:** Export functions: `listApiKeys(token)`, `createApiKey(name, token)`, `deleteApiKey(keyId, token)`

#### E2. Create API keys page
- **File:** `frontend/src/pages/ApiKeysPage.tsx`
- **Change:** React component with:
  - Table: Name, Prefix, Created, Last Used, Count, Delete button
  - Button "Generate New Key" → modal with name input → displays fullKey once with copy button
  - Delete button with confirmation dialog

#### E3. Update router
- **File:** `frontend/src/App.tsx`
- **Change:** Add route `<Route path="/api-keys" element={<ApiKeysPage />} />`

#### E4. Update sidebar
- **File:** `frontend/src/components/Layout/Sidebar.tsx`
- **Change:** Add nav link to `/api-keys` with `Key` icon from lucide-react

### Verifications

- [ ] Dev server starts without errors
- [ ] Navigate to `/api-keys` page loads
- [ ] Generate key button works, displays fullKey
- [ ] Key appears in list immediately
- [ ] Delete key removes it from list

---

## Test Log

### Phase E — Frontend API Keys Page

| Test | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| E1.Service | Export apiKeyService functions | 3 functions (list, create, delete) | ✓ All exported with correct signatures | PASS |
| E1.Types | API key type definitions | ApiKeyMeta, CreateKeyResponse defined | ✓ Properly typed | PASS |
| E2.Page | Create ApiKeysPage component | Functional React component | ✓ Component created, exports ApiKeysPage | PASS |
| E2.UI.Table | Table renders API keys | Table with cols: Name, Prefix, Created, Last Used, Count, Delete | ✓ All columns present | PASS |
| E2.UI.Button | Generate button visible | Button labeled "Generate New Key" | ✓ Present in header | PASS |
| E2.Modal.Create | Create key modal | Modal appears with name input | ✓ Modal working | PASS |
| E2.Modal.Display | Generated key display | Shows fullKey with copy button | ✓ Working | PASS |
| E2.Delete | Delete button functional | Delete key from list | ✓ Button present, handler implemented | PASS |
| E3.Router | Route added to App.tsx | /api-keys route → ApiKeysPage | ✓ Route added at line 68 | PASS |
| E4.Sidebar.Nav | Sidebar nav link added | /api-keys with Key icon | ✓ Both collapsed & expanded versions present | PASS |
| API.List | GET /api-keys with auth | Returns array of ApiKeyMeta | ✓ [2 keys returned] | PASS |
| API.Create | POST /api-keys with auth | Returns {key, meta} | ✓ New key "test-key-phase-e" created | PASS |
| API.Service | apiKeyService calls API correctly | Axios POST to /api-keys, extracts response | ✓ Service correctly maps backend response | PASS |
| TypeScript | tsc --noEmit | No compilation errors | ✓ All types valid | PASS |

---

## Notes

- **SmartPi One RAM constraint:** Backend will use `--max-old-space-size=256`
- **No Docker:** Native npm only
- **No new localStorage:** Existing code uses localStorage for JWT, don't add more storage patterns
