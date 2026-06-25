# THRML Ising engine — Grok Forge setup

Forge includes a **THRML signal bar** in the studio. It suggests observe / plan / execute / verify modes from urgency, uncertainty, and exploration scores.

**Out of the box:** hash-based fallback (no Python, no JAX). The studio works fully without THRML.

**Optional upgrade:** real **Ising sampling** via the [THRML](https://github.com/extropic-ai/thrml) repo and JAX.

---

## Quick check

```bash
# With dev server running:
npm run thrml:check
# or
curl -s -X POST http://localhost:3000/api/thrml \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Forge THRML check"}' | python3 -m json.tool
```

| `using_thrml` | `engine` | Meaning |
|---------------|----------|---------|
| `false` | `deterministic-fallback` | Hash fallback (default) |
| `true` | `thrml-ising` | JAX Ising sampler active |

Studio badge: **THRML Ising** (green) vs **Hash fallback** (amber).

---

## Enable Ising (5–15 min)

### 1. Clone THRML

```bash
git clone https://github.com/extropic-ai/thrml.git ~/thrml
```

### 2. Python venv + JAX

From your `grok-forge` directory:

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install jax jaxlib equinox
```

### 3. Configure Forge

Add to `.env.local`:

```bash
THRML_REPO_PATH=/Users/you/thrml    # absolute path to clone
THRML_PYTHON=.venv/bin/python        # or full path to venv python
```

### 4. Restart dev server

```bash
npm run dev:local
```

Open **http://localhost:3000/studio** — THRML bar should show **THRML Ising**.

Check **Deploy** panel (`4`) → THRML row: `ising · configured`.

---

## How it works

```
Studio prompt → POST /api/thrml → scripts/thrml_signal.py
                                      ↓
                    THRML_REPO_PATH set + JAX installed?
                         yes → thrml-ising (IsingEBM sample)
                         no  → deterministic-fallback (SHA-256 hash)
```

- Python bridge timeout: 8s
- Fallback reason shown in studio when Ising unavailable
- Session export (`⌘⇧E`) includes the last THRML signal JSON

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Badge stays **Hash fallback** | Set `THRML_REPO_PATH` to valid clone; restart server |
| `ModuleNotFoundError: jax` | `pip install jax jaxlib` in the venv |
| `ModuleNotFoundError: thrml` | `THRML_REPO_PATH` must point at repo root (contains `thrml/` package) |
| Wrong Python | Set `THRML_PYTHON` to venv binary |
| `THRML_REPO_PATH not set` | Add to `.env.local`, not only shell export |
| Docker Forge | Mount THRML path + venv, or use hash fallback |

---

## Links

- Forge repo: https://github.com/xre217/grok-forge
- THRML upstream: https://github.com/extropic-ai/thrml
- Studio: `/studio` after `npm run dev:local`