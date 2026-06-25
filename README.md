# Grok Forge

**Your local AI studio** — chat, skills, THRML signals, session export/import, and optional ledger memory. Runs on Ollama. No cloud bill required.

Fork it, run it on your machine, own your sessions.

**Self-host & demo walkthrough:** [DEMO.md](./DEMO.md) — local dev, Docker, VPS, troubleshooting.

**Ship / fork checklist:** [DISTRIBUTION.md](./DISTRIBUTION.md) — template repo, GIF, blind fork test.

## Quick start (5–10 minutes)

### Prerequisites

- **Node.js 20+**
- **[Ollama](https://ollama.com)** (for local chat)
- **~2 GB disk** for the default model (`llama3.2:3b`) on first pull

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

### Verify it works

With the dev server running:

```bash
npm run verify
# custom port: npm run verify http://localhost:3001
```

### First-run notes

| Situation | What to do |
|-----------|------------|
| **Model download slow** | First `ollama pull llama3.2:3b` is ~2 GB — normal on fresh install |
| **Port 3000 in use** | `PORT=3001 npm run dev:local` then open `http://localhost:3001/studio` |
| **Chat fails** | Ensure `ollama serve` is running and the model finished pulling |
| **Fork test** | `git clone` → `bash scripts/setup.sh` → `npm run dev:local` → `npm run verify` |

## What you get

| Feature | Description |
|---------|-------------|
| **Local chat** | Ollama-first reasoning (`llama3.2:3b` by default) |
| **Skills rail** | Inject system prompts — Build, Debug, Explain, Design, Deploy |
| **THRML bar** | Observe / plan / execute / verify — **THRML Ising** or hash fallback badge |
| **Session export** | `⌘⇧E` — JSON bundle with chat, ledger slice, runtime, THRML |
| **Session import** | `⌘⇧I` — restore a previous export |
| **Chat persistence** | Survives refresh via `localStorage` |
| **Model picker** | Switch Ollama models in the chat header (no `.env` edit) |
| **Ledger pin** | Bookmark icon on replies → `POST /api/ledger` |
| **Ledger panel** | Read optional memory at `~/.jarvis/memory/ledger.jsonl` |
| **Explore** | Missions for consciousness, cosmos, and collective discovery |
| **Consciousness Stream** | Team exploration log from ledger |
| **Team memory** | Ledger pins + explorations injected into every chat turn |
| **Team bundles** | Export/import exploration + memory JSON for your crew |
| **Import preview** | Review missions + new/duplicate entries before merging |
| **Bundle diff** | Side-by-side ledger vs incoming bundle before merge |
| **Crew log** | localStorage timeline — exported in session + team bundles |
| **Memory strip** | Live preview of active team memory above chat |
| **First-run checklist** | Three-step onboarding to activate the memory loop |
| **Memory citations** | Shows which ledger entries shaped each reply (chips + hover) |
| **⌘K palette** | Keyboard-first studio control |
| **EN / 中文** | Bilingual UI toggle |

## Configuration

Copy `.env.example` to `.env.local` and customize:

| Variable | Default | Purpose |
|----------|---------|---------|
| `FORGE_MODE` | `local` | `local` \| `hybrid` \| `cloud` |
| `FORGE_USER_NAME` | `you` | Name used in system prompt |
| `FORGE_TEAM_NAME` | `Forge Crew` | Label on team bundle exports |
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

## Forge ≠ Grok cloud

**Grok Forge** is your local studio. **Grok** (xAI) is an optional API engine.

Default (`FORGE_MODE=local`): Ollama only — no xAI key, no cloud bill.

Hybrid (optional): see **[DEMO.md](./DEMO.md#optional-grok-api-hybrid-mode)** — studio shows `LOCAL` / `HYBRID` / `GROK` chips and per-reply engine badges.

## Optional: THRML Ising engine

By default THRML uses a **hash fallback** (works out of the box). The studio shows an engine badge: **THRML Ising** (green) vs **Hash fallback** (amber).

For JAX Ising sampling, see **[THRML.md](./THRML.md)**. Quick check: `npm run thrml:check`.

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Local/hybrid reasoning |
| `/api/status` | GET | Runtime health |
| `/api/ledger` | GET | Recent ledger entries |
| `/api/ledger` | POST | Append ledger entry |
| `/api/thrml` | POST | THRML signal |
| `/api/config` | GET | Public forge config + skills |
| `/api/memory` | GET | Team memory entries + context preview |
| `/api/team-bundle/import` | POST | Merge team bundle into ledger |
| `/api/sessions` | GET/POST | List / save server-side session backups |

### Record a ledger entry

```bash
curl -X POST http://localhost:3000/api/ledger \
  -H 'Content-Type: application/json' \
  -d '{"type":"observation","claim":"Forge public MVP shipped"}'
```

## Session export format

Exports are `grok-forge-session` v1.0 or v1.1 JSON files (v1.1 adds `consciousnessStream`):

```json
{
  "format": "grok-forge-session",
  "version": "1.1",
  "session": { "messages": [], "locale": "en", ... },
  "thrml": { ... },
  "ledger": { "slice": [ ... ] },
  "consciousnessStream": [ ... ],
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
│   ├── verify-forge.sh   # Health-check routes + studio
│   ├── run-local.sh      # Production-like local server
│   └── thrml_signal.py   # THRML Python bridge
├── DEMO.md               # Self-host & demo walkthrough
└── .env.example
```

## Docker (Ollama on host)

See **[DEMO.md](./DEMO.md)** for the full Docker and VPS guide. Quick start:

```bash
ollama serve   # keep running on host
npm run docker:up
# → http://localhost:3847/studio
npm run verify http://localhost:3847
```

```bash
npm run docker:down
```

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
| `npm run verify` | Health-check routes + team bundle import (`npm run verify http://localhost:3001`) |
| `npm run fork-test` | Stranger path: `npm ci` + typecheck + build (no Ollama) |

## Deploy (self-hosted)

```bash
npm run build
FORGE_MODE=local npm run start
```

Vercel deploy is optional — Forge is designed to run on your machine.

## Changelog

### v0.17.0 — Import winner after compare
- **Compare → import** — Import A / Import B opens the ledger diff preview before merge
- **Suggested badge** — picks winner by new vs ledger, uniqueness vs other bundle, then recency
- **`stageBundle()`** — stage import from in-memory bundle (compare flow, no re-pick file)

### v0.16.0 — Crew log panel + THRML in Explore
- **Crew log panel** — dedicated studio tab (`6` / nav / ⌘K) with kind filters, search, and full event history
- **Header crew log** — "View all" jumps to the crew panel
- **Explore THRML** — engine badge (`Ising` / `Hash fallback`) on high-exploration voyage hint

### v0.15.0 — Compare two bundles
- **Compare bundles** — pick two team bundle JSON files; see memory diff (only in A/B, shared, claim changed)
- **Crew log diff** — when either bundle carries `crewLog`, compare shared vs unique events
- **Explore panel** + **⌘K** — "Compare team bundles" opens side-by-side preview before import

### v0.14.0 — Crew log export
- **Session export v1.2** — includes `crewActivity` slice (last 32 events)
- **Team bundle v1.1** — optional `crewLog` on export; merged on import (deduped by id)
- **Import preview** — shows crew log event count when bundle carries activity
- Session import restores crew log into localStorage alongside chat

### v0.13.0 — THRML engine clarity
- **Engine badge** — `THRML Ising` vs `Hash fallback` on signal bar + setup hint panel
- **THRML.md** — JAX/Ising setup guide, troubleshooting, verify steps
- **`npm run thrml:check`** — probes `/api/status` + `/api/thrml` for live engine
- **`/api/status`** — exposes `thrml` runtime config (repo path, setup ready)
- **Deploy panel** — THRML row (`ising · configured` / `hash fallback`)

### v0.12.0 — Bundle diff vs ledger
- **Diff tab** in import preview — bundle entries vs your ledger side-by-side
- **Claim changed** badge when same id has different text (still skipped on merge)
- **Ledger fetch** — import preview compares up to 500 ledger entries (was capped at 50)

### v0.11.0 — Crew activity log
- **Crew log** — collapsible studio timeline (pins, explores, bundle + session I/O)
- **localStorage** — persists last 64 crew events on your machine
- **Auto-logging** — pin, Explore distill, team bundle export/import, session export/import

### v0.10.0 — Bundle import preview
- **Import preview modal** — see team, missions, and entries before merge
- **New vs duplicate badges** — compares bundle IDs against your ledger
- **Merge N entries** — confirm only imports new rows; duplicates skipped
- Works from Explore panel and studio import (`⌘⇧I` / ⌘K)

### v0.9.0 — Memory citations
- **Memory citations** — assistant replies show which ledger entries shaped the answer (type, tags, claim preview)
- **`memoryUsed` in `/api/chat`** — returns citation array alongside `memoryInjected` count
- **`FORGE_TEAM_NAME`** — crew label for team bundle exports (falls back to `FORGE_PROJECT`)
- **`/api/config`** — exposes `teamName` for bundle export UI

### v0.8.1 — Distribution & crew shortcuts
- **`DISTRIBUTION.md`** — template repo, GIF, release, blind fork checklist
- **`npm run fork-test`** — CI + local stranger build path (no Ollama)
- **`⌘⇧B`** + ⌘K — export team bundle; verify imports fixture bundle
- Command palette team bundle commands

### v0.8.0 — Team bundles
- **Team bundle export** — explorations, pins, mission slices as `grok-forge-team-bundle` JSON
- **Team bundle import** — merge into ledger (dedupe by id); Explore panel + studio Import
- **Mission tags** — `mission:{id}` on explore log entries for bundle grouping

### v0.7.0 — Engine clarity
- **Runtime chips** — `LOCAL` / `HYBRID` / `GROK` / `OFFLINE` in studio + chat headers
- **Engine badges** on every assistant reply (`Ollama · model` / `Grok · model` + fallback)
- **Landing callout** — "Not the Grok chatbot. Ollama by default."
- **DEMO.md** — hybrid Grok API setup guide

### v0.6.2 — Demo & landing
- **DEMO.md** — local dev, Docker, VPS self-host, demo walkthrough, troubleshooting
- **Landing page** — stranger-friendly pitch, how-it-works steps, use-case pills, self-host link

### v0.6.1 — Fork-test polish
- **setup.sh** — first-run tips (model size, port conflict, `npm run verify`)
- **README** — verify step, first-run troubleshooting table

### v0.6.0 — First-run memory
- **Onboarding checklist** — chat → pin/explore → memory live (auto-dismisses when done)
- **Memory badge** on assistant replies (`N memories active`)
- **Empty-state CTAs** on memory strip — pin hint + Open Explore button

### v0.5.0 — Closed memory loop
- **Team memory** — explorations, pins, and forge entries prioritized into chat system prompt
- **`/api/memory`** — team memory entries + context preview for UI
- **Memory strip** — horizontal preview above chat; refreshes on ledger pin
- **Session export v1.1** — includes `consciousnessStream` slice
- **`npm run verify`** — one-command health check for fork testers

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