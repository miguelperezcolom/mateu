# Mateu promo videos

Short videos that explain the **agent-operability plane** (the UI is data → agents can *operate*
and *author* Mateu apps): a **2.5-min explainer** and a **~45s teaser**, in **English and Spanish**.
Rendered from slides + synthesized voice, with the **real** demo output embedded (a live LLM authoring
UIDL / operating a booking app over MCP — not mock-ups).

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
node build.mjs                        # English pair → out/explainer.mp4, out/teaser.mp4
node build.mjs --target teaser
node build.mjs --target explainer-es  # Spanish (voice "Mónica") → out/explainer-es.mp4
node build.mjs --target teaser-es
PROMO_VOICE="Alex" node build.mjs --target explainer   # override the English voice
```

Targets: `explainer`, `teaser`, `explainer-es`, `teaser-es`. Spanish scenes live in `scenes.es.mjs`;
per-target voices in `VOICES` (`scenes.mjs`).

## Publishing to YouTube

See **`youtube.md`** for ready-to-paste titles, descriptions (with chapters) and tags for all four
videos, plus the upload options (manual in YouTube Studio, or the API path).

## Honesty guardrail

Matches the docs and the ADR: **runtime operability** (MCP + in-app assistant) is *shipped and
verified* across Java/.NET/Python; **prompt-to-app** is a *proof of concept* (spike/beta). The videos
present them as such — don't recut them to imply prompt-to-app is GA.
