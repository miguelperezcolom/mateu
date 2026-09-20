# Mateu promo videos

Two short videos that explain the **agent-operability plane** (the UI is data → agents can *operate*
and *author* Mateu apps): a **2.5-min explainer** and a **~45s teaser**. Rendered from slides +
synthesized voice, with the **real** demo output embedded (a live LLM authoring UIDL / operating a
booking app over MCP — not mock-ups).

> **Draft-quality by design.** Slide-based, macOS `say` voice. Great for a dev-rel explainer or as a
> storyboard for a polished cut — swap in a human voice + motion graphics and keep the copy. The
> hand-off scripts are `explainer.script.md` and `teaser.script.md`.

## Files

| File | What |
|---|---|
| `explainer.script.md`, `teaser.script.md` | Production-ready scripts (on-screen + voiceover + timing). |
| `theme.mjs` | Slide theme + helpers (self-contained CSS, 1280×720). |
| `scenes.mjs` | The two scene lists; embeds the real captured demo output. |
| `build.mjs` | Pipeline: HTML → PNG (Playwright) → + `say` voiceover → MP4 clip → concat. |
| `out/*.mp4` | Rendered videos (git-ignored; published as release assets). |

## Build

Needs macOS `say`, `ffmpeg`/`ffprobe`, and the e2e Playwright+Chromium (already installed for e2e).
No new dependencies.

```bash
node build.mjs                 # both videos → out/explainer.mp4, out/teaser.mp4
node build.mjs --target teaser
PROMO_VOICE="Alex" node build.mjs --target explainer   # pick a different macOS voice
```

## Honesty guardrail

Matches the docs and the ADR: **runtime operability** (MCP + in-app assistant) is *shipped and
verified* across Java/.NET/Python; **prompt-to-app** is a *proof of concept* (spike/beta). The videos
present them as such — don't recut them to imply prompt-to-app is GA.
