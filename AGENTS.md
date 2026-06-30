<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single product: **Grok Forge**, a Next.js 16 (React 19, Turbopack) local AI studio. The studio lives at `/studio`. Standard commands are in `package.json` and `README.md`; only the non-obvious caveats are noted here.

- **Local chat needs Ollama.** Chat (`/api/chat`) calls a local Ollama model (`llama3.2:3b`). The model and Ollama are already installed in the VM snapshot. Ollama runs as a manual process (systemd is not available in this VM), so start it yourself before testing chat: `ollama serve` (e.g. in a tmux session). Verify with `curl http://127.0.0.1:11434/api/tags`. Non-chat features (studio UI, `/api/status`, `/api/config`, `/api/ledger`, `/api/memory`, THRML hash fallback, export/import) work without Ollama.
- **AMX backend crash (critical gotcha).** This VM's CPU advertises Intel AMX, but it is not usable in the guest. Ollama's `sapphirerapids` ggml CPU backend segfaults on model load ("llama-server process has terminated: signal: segmentation fault"). The fix already applied in the snapshot: `libggml-cpu-sapphirerapids.so` was moved out of `/usr/local/lib/ollama/` into `/usr/local/lib/ollama/_disabled/` so ggml falls back to an AVX-512 backend. If you ever reinstall or upgrade Ollama, re-apply this move or `llama-server` will crash on every chat request.
- **Run/verify.** Dev: `npm run dev:local` → http://localhost:3000/studio. With the server up, `npm run verify` health-checks all routes (it POSTs a fixture team bundle too). Production-like: `npm run build` then `npm run forge:local` (port 3847).
- **Lint.** `npm run lint` currently reports pre-existing `react-hooks` errors in committed source (e.g. `src/hooks/use-thrml-signal.ts`, `src/hooks/use-forge-model.ts`). These are not environment problems; do not "fix" them as part of setup.
- **Env.** Copy `.env.example` to `.env.local` for local dev (defaults to `FORGE_MODE=local`, Ollama-only, no xAI key required).
