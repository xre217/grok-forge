# Grok Forge

**Your local AI studio** — chat, skills, THRML signals, session export/import, and optional ledger memory. Runs on Ollama. No cloud bill required.

Fork it, run it on your machine, own your sessions.

## Quick start (5 minutes)

### Prerequisites

- **Node.js 20+**
- **[Ollama](https://ollama.com)** (for local chat)

### Setup

```bash
git clone https://github.com/xre217/grok-forge.git
cd grok-forge
bash scripts/setup.sh
```

Or manually:

```bash
npm install
cp .env.example .env.local
ollama pull llama3.2:3b
```

### Run

```bash
# Development
npm run dev:local
# → http://localhost:3000/studio

# Production-like local server
npm run forge:local
# → http://localhost:3847/studio
```

Open the studio, pick a skill, start chatting. Your messages go to **Ollama on your machine** — not the cloud.

## What you get

| Feature | Description |
|---------|-------------|
| **Local chat** | Ollama-first reasoning (`llama3.2:3b` by default) |
| **Skills rail** | Inject system prompts — Build, Debug, Explain, Design, Deploy |
| **THRML bar** | Observe / plan / execute / verify signal from your prompt |
| **Session export** | `⌘⇧E` — JSON bundle with chat, ledger slice, runtime, THRML |
| **Session import** | `⌘⇧I` — restore a previous export |
| **Chat persistence** | Survives refresh via `localStorage` |
| **Model picker** | Switch Ollama models in the chat header (no `.env` edit) |
| **Ledger pin** | Bookmark icon on replies → `POST /api/ledger` |
| **Ledger panel** | Read optional memory at `~/.jarvis/memory/ledger.jsonl` |
| **Explore** | Missions for consciousness, cosmos, and collective discovery |
| **Consciousness Stream** | Team exploration log from ledger |
| **⌘K palette** | Keyboard-first studio control |
| **EN / 中文** | Bilingual UI toggle |

## Configuration

Copy `.env.example` to `.env.local` and customize:

| Variable | Default | Purpose |
|----------|---------|---------|
| `FORGE_MODE` | `local` | `local` \| `hybrid` \| `cloud` |
| `FORGE_USER_NAME` | `you` | Name used in system prompt |
| `FORGE_PERSONA` | (built-in) | Custom co-pilot personality |
| `OLLAMA_MODEL` | `llama3.2:3b` | Local reasoner model |
| `FORGE_LEDGER_ENABLED` | `1` | Enable ledger read/write |
| `JARVIS_HOME` | `~/.jarvis` | Ledger directory |
| `FORGE_PACK` | (none) | Set to `vilo` for VILO advanced pack |
| `THRML_REPO_PATH` | (unset) | Path to THRML repo for real Ising engine |

### VILO pack (optional, advanced)

For sovereignty workflows (Evidence Ledger as constitution, VILO skill):

```bash
FORGE_PACK=vilo
NEXT_PUBLIC_FORGE_PACK=vilo
```

## Optional: cloud Grok (xAI)

When you have xAI credits:

```bash
FORGE_MODE=hybrid
XAI_API_KEY=your-key
```

Local mode bypasses xAI entirely — useful when credits are exhausted.

## Optional: THRML Ising engine

By default THRML uses a deterministic hash fallback (works out of the box).

For real Ising sampling:

```bash
pip install jax equinox
export THRML_REPO_PATH=/path/to/thrml
```

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Local/hybrid reasoning |
| `/api/status` | GET | Runtime health |
| `/api/ledger` | GET | Recent ledger entries |
| `/api/ledger` | POST | Append ledger entry |
| `/api/thrml` | POST | THRML signal |
| `/api/config` | GET | Public forge config + skills |
| `/api/sessions` | GET/POST | List / save server-side session backups |

### Record a ledger entry

```bash
curl -X POST http://localhost:3000/api/ledger \
  -H 'Content-Type: application/json' \
  -d '{"type":"observation","claim":"Forge public MVP shipped"}'
```

## Session export format

Exports are `grok-forge-session` v1.0 JSON files:

```json
{
  "format": "grok-forge-session",
  "version": "1.0",
  "session": { "messages": [], "locale": "en", ... },
  "thrml": { ... },
  "ledger": { "slice": [ ... ] },
  "summary": "..."
}
```

Import via the studio **Import** button or `⌘⇧I`.

## Project structure

```
grok-forge/
├── src/
│   ├── app/api/          # Chat, ledger, THRML, status, config
│   ├── components/forge/ # Studio UI
│   ├── hooks/            # Chat, export, import, THRML
│   └── lib/              # Reasoning, ledger, skills, config
├── scripts/
│   ├── setup.sh          # First-run setup
│   ├── run-local.sh      # Production-like local server
│   └── thrml_signal.py   # THRML Python bridge
└── .env.example
```

## Docker (Ollama on host)

Forge in Docker talks to Ollama on your machine via `host.docker.internal`:

```bash
ollama serve   # keep running on host
npm run docker:up
# → http://localhost:3847/studio
```

```bash
npm run docker:down
```

Volumes persist `~/.forge` session backups and ledger at `/data/jarvis` inside the container.

## VILO pack (Tre / advanced)

```bash
npm run vilo:preset
npm run dev:local
```

Enables `FORGE_PACK=vilo`, VILO skill, and ledger constitution mode.

## Use as GitHub template

On GitHub: **Settings → General → Template repository** (enable), then others click **Use this template**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:local` | Dev server with local mode |
| `npm run forge:local` | Build + start on port 3847 |
| `npm run setup` | Install deps, create `.env.local`, pull Ollama model |
| `npm run vilo:preset` | Enable VILO pack in `.env.local` |
| `npm run docker:up` | Docker Compose build + run |
| `npm run docker:down` | Stop Docker stack |

## Deploy (self-hosted)

```bash
npm run build
FORGE_MODE=local npm run start
```

Vercel deploy is optional — Forge is designed to run on your machine.

## Changelog

### v0.4.0 — Consciousness & Cosmos
- **Explore panel** (`5` / Telescope) — six missions across consciousness, cosmos, craft, collective
- **Consciousness Stream** — live feed of exploration ledger entries
- **`/api/explore`** — distill reflections via Ollama → append to ledger
- **Cosmos Explore skill** — bridge Explore → Chat for team dialogue

### v0.3.0
- Docker + Compose (Ollama on host)
- GitHub CI workflow
- Server-side session backup on export (`~/.forge/sessions/`)
- Ledger panel live-refresh on pin
- `npm run vilo:preset` for VILO pack

### v0.2.0
- Ollama model picker in studio (persisted in browser)
- Pin assistant replies to ledger
- First-run onboarding banner
- THRML bar collapses on Ledger / Local panels

### v0.1.0
- Public MVP: local chat, skills, THRML, export/import, forkable config

## License

MIT — fork freely.

## Related projects

- **[grok-concierge](https://github.com/xre217/grok-concierge)** — Full VILO / JARVIS sovereignty stack (heavier)
- **Grok Forge** — Lightweight local studio (this repo)