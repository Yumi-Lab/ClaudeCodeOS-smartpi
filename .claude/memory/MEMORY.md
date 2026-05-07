# Mémoire Claude — ClaudeCodeOS-smartpi

## Project Overview
**ClaudeCodeOS-smartpi** — Commercial appliance API: Claude Code + OpenAI-compatible API exposed on SmartPi One (ARM, 1GB RAM).

## Current Protocols
- [protocol_openai-api-bridge.md](protocol_openai-api-bridge.md) — Claude-Code-Board API + Keys (✅ Phases A-E complete)
- [protocol_claude-code-board-integration.md](protocol_claude-code-board-integration.md) — ClaudeCodeOS integration (📋 Ready for Phase A)

## Related Repos
- **Claude-Code-Board** (`~/Documents/GitHub/Claude-Code-Board`) — Backend (Express + Socket.IO + SQLite) + Frontend (React 19)
  - Branch: `protocol/openai-api-bridge`
  - Phases B-E: API keys + OpenAI bridge + UI
  
- **ClaudeCodeOS-smartpi** (this repo) — SmartPi One image builder
  - Branch: `protocol/fix-claude-cli-nodejs20` (Phase A completed)
  - Phase A: Fixed Node.js 20 installation in claudecode module
  - Phase F (future): Integrate Claude-Code-Board into image

## Status
- ✅ **Phase A** (ClaudeCodeOS): Fixed Claude Code CLI Node.js 20 installation
- ✅ **Phase B** (Claude-Code-Board): DB Migration + ApiKeyService
- ⏳ **Phase C** (Claude-Code-Board): CRUD Endpoints + Auth Extension — in progress
- ⏳ **Phases D-E** (Claude-Code-Board): OpenAI Bridge + Frontend API Keys
- ⏳ **Phase F** (ClaudeCodeOS): Image integration

## Key Constraints
- **No Docker** — native npm only
- **RAM:** 1GB SmartPi One → `--max-old-space-size=256` for Node.js
- **Architecture:** armhf (32-bit ARM)
- **No localStorage** — except existing JWT pattern in frontend
