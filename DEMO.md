# Grok Forge — Demo & self-host guide

Run Forge on your machine or a small VPS. No Vercel account required. Ollama does the reasoning locally.

## What you get

| Piece | Purpose |
|-------|---------|
| **Studio** (`/studio`) | Chat, skills, explore missions, memory strip |
| **Ollama** | Local LLM on your hardware — not the cloud |
| **Ledger** (optional) | Pin replies & explorations → team memory in every chat |
| **Export** (`⌘⇧E`) | JSON session bundle you own and can share |

---

## Option A — Local dev (fastest)

**Time:** 5–10 minutes (first Ollama model pull is ~2 GB)

### Prerequisites

- Node.js 20+
- [Ollama](https://ollama.com)

### Steps

```bash
git clone https://github.com/xre217/grok-forge.git
cd grok-forge
bash scripts/setup.sh
npm run dev:local
```

Open **http://localhost:3000/studio**

### Verify

```bash
npm run verify
# custom port: npm run verify http://localhost:3001
```

### Port 3000 busy?

```bash
PORT=3001 npm run dev:local
# → http://localhost:3001/studio
npm run verify http://localhost:3001
```

---

## Option B — Docker (Ollama on host)

Forge runs in Docker; Ollama stays on your machine.

### Prerequisites

- Docker + Docker Compose
- Ollama running on the host

### Steps

```bash
# Terminal 1 — keep Ollama running
ollama serve
ollama pull llama3.2:3b

# Terminal 2 — Forge container
git clone https://github.com/xre217/grok-forge.git
cd grok-forge
npm run docker:up
```

Open **http://localhost:3847/studio**

### Verify

```bash
npm run verify http://localhost:3847
```

### Stop

```bash
npm run docker:down
```

### Data persistence

Docker volumes store:

- Session backups → `forge-data` volume (`/data/forge` in container)
- Ledger → `jarvis-ledger` volume (`/data/jarvis` in container)

---

## Option C — VPS self-host (share on your network)

Expose Forge on a small Linux VPS or homelab box. **Keep Ollama on the same machine** (or reachable privately).

### 1. Install prerequisites

```bash
# Ubuntu/Debian example
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

### 2. Clone and build

```bash
git clone https://github.com/xre217/grok-forge.git
cd grok-forge
bash scripts/setup.sh
npm run forge:local
```

`forge:local` builds and starts on **port 3847** by default.

### 3. Reverse proxy (recommended)

Put Forge behind Caddy or nginx with TLS. Example Caddy:

```text
forge.yourdomain.com {
  reverse_proxy localhost:3847
}
```

### 4. Firewall

Only expose 443 (proxy). Do **not** expose Ollama port 11434 to the public internet.

### 5. Verify on the server

```bash
npm run verify http://localhost:3847
```

---

## First-run walkthrough (for demos)

1. **Open studio** → send a message (Ollama replies locally)
2. **Pin a reply** → bookmark icon on an assistant message
3. **Watch memory strip** → pinned entry appears above chat
4. **Send another message** → reply shows **Shaped by (N)** chips — hover for full claim text
5. **Open Explore** (panel `5`) → log a mission reflection
6. **Export** (`⌘⇧E`) → download JSON session bundle

Onboarding checklist at the top guides new users through steps 1–3.

---

## Sharing with teammates

Forge is local-first. To share context:

### Team bundles (explorations + memory)

Best for **crew explorations** without sharing full chat history:

1. **Explore panel** → **Export bundle** (or studio **Import** accepts bundles too)
2. Send `grok-forge-team-bundle-*.json` to a teammate
3. They **Import bundle** in Explore — entries merge into ledger (deduped by id)
4. Memory strip + chat injection pick up imported pins and explorations

Bundle includes: exploration observations, pinned replies, mission groupings.

### Full sessions (chat + everything)

1. **Export session** — `⌘⇧E` downloads `grok-forge-session-*.json`
2. **Teammate imports** — `⌘⇧I` or Import button in studio
3. **Ledger** — optional shared memory at `~/.jarvis/memory/ledger.jsonl` (same machine or sync the file)

---

## Environment variables (common)

| Variable | Default | Notes |
|----------|---------|-------|
| `FORGE_MODE` | `local` | `local` \| `hybrid` \| `cloud` |
| `OLLAMA_MODEL` | `llama3.2:3b` | Must be pulled in Ollama |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434/api` | Docker uses `host.docker.internal` |
| `FORGE_PORT` | `3847` | Production / Docker port |
| `FORGE_LEDGER_ENABLED` | `1` | Set `0` to disable ledger |
| `FORGE_USER_NAME` | `you` | Shown in system prompt |
| `FORGE_TEAM_NAME` | `Forge Crew` | Label on team bundle exports |

Copy `.env.example` → `.env.local` for local dev. Docker reads from `docker-compose.yml` + host env.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Chat fails / 502 | `ollama serve` running? Model pulled? |
| `verify` fails | Server running? Correct port in URL? |
| Docker can't reach Ollama | Ollama on host; `host.docker.internal` (Linux: compose `extra_hosts` is set) |
| Empty memory strip | Pin a reply or log an Explore mission |
| Slow first setup | `llama3.2:3b` download is ~2 GB — one-time |

---

## Optional: Grok API (hybrid mode)

**Forge is not the Grok app.** By default everything runs on **Ollama locally**.
Grok only appears when you opt in with an API key.

### Hybrid setup

```bash
# .env.local
FORGE_MODE=hybrid
# Remove or set FORGE_LOCAL_FIRST=0 so hybrid can reach xAI
FORGE_LOCAL_FIRST=0
XAI_API_KEY=your-xai-key
XAI_MODEL=grok-4.3
```

Restart the server, then check the studio header chip:

| Chip | Meaning |
|------|---------|
| **LOCAL** | Ollama only — Grok not used |
| **HYBRID** | Grok first, Ollama fallback if credits fail |
| **GROK** | Cloud mode — API only |
| **OFFLINE** | Ollama not running |

Each assistant reply shows an **engine badge** (`Ollama · model` or `Grok · model`).
Fallback replies also show **Ollama fallback**.

### Stay local-only (recommended for forks)

```bash
FORGE_MODE=local
FORGE_LOCAL_FIRST=1
# No XAI_API_KEY needed
```

---

## Links

- Repo: https://github.com/xre217/grok-forge
- README: setup, API routes, changelog
- Studio: `/studio` after start