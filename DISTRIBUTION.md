# Grok Forge — Distribution checklist

Ship proof for strangers: fork, run, share with a crew.

## 1. GitHub template (2 min)

1. Open https://github.com/xre217/grok-forge/settings
2. **General** → check **Template repository**
3. Save

New users: **Use this template** → clone their copy.

## 2. Pin the release (1 min)

1. **Releases** → **Draft a new release**
2. Choose tag `v0.17.0` (or latest)
3. Title: `v0.17.x — Compare-to-import & local studio`
4. Paste changelog from README
5. Publish

## 3. README demo GIF (15 min)

Record **15–30 seconds** showing:

1. Open `/studio`
2. Send a chat message (Ollama reply + engine badge)
3. Pin a reply → memory strip updates
4. Explore → Export bundle
5. (Optional) Import bundle on second machine

Save as `docs/forge-demo.gif`, add to README:

```markdown
![Grok Forge demo](./docs/forge-demo.gif)
```

Tools: macOS Screenshot app, Kap, or `ffmpeg` screen capture.

## 4. Automated checks (already in repo)

```bash
# Stranger build path (no Ollama)
bash scripts/fork-test.sh

# Live server (Ollama required for chat)
npm run dev:local
npm run verify
```

CI runs `fork-test.sh` on every push to `main`.

## 5. Blind fork test (10 min)

On a **clean machine** or temp directory:

```bash
git clone https://github.com/xre217/grok-forge.git
cd grok-forge
bash scripts/setup.sh          # ~2 GB model on first pull
npm run dev:local
npm run verify
```

Pass criteria: all 6 verify checks + chat reply + bundle export/import.

## 6. Live demo (optional)

See [DEMO.md](./DEMO.md) Option C — VPS + Docker + reverse proxy.

Do **not** expose Ollama port `11434` publicly.

## 7. Tell strangers (one paragraph)

> **Grok Forge** is your local AI studio — not the Grok cloud app. Chat on Ollama, pin team memory, export sessions, share **team bundles** with your crew. Fork it, run it on your machine, own your data.

Links:
- Repo: https://github.com/xre217/grok-forge
- Quick start: [README](./README.md)
- Self-host: [DEMO.md](./DEMO.md)

## 8. What not to block on

- Vercel deploy (402 billing) — Docker/self-host is the story
- THRML Ising setup optional — see THRML.md; hash fallback is fine for MVP
- grok-concierge merge — keep Forge lightweight