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
| **Ledger panel** | Read optional memory at `~/.jarvis/memory/ledger.jsonl` |
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

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:local` | Dev server with local mode |
| `npm run forge:local` | Build + start on port 3847 |
| `bash scripts/setup.sh` | Install deps, create `.env.local`, pull Ollama model |

## Deploy (self-hosted)

```bash
npm run build
FORGE_MODE=local npm run start
```

Vercel deploy is optional — Forge is designed to run on your machine.

## License

MIT — fork freely.

## Related projects

- **[grok-concierge](https://github.com/xre217/grok-concierge)** — Full VILO / JARVIS sovereignty stack (heavier)
- **Grok Forge** — Lightweight local studio (this repo)