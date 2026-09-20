# YouTube — upload guide + ready-to-paste metadata

Four videos in `out/`: `explainer.mp4` / `teaser.mp4` (English) and `explainer-es.mp4` /
`teaser-es.mp4` (Spanish). They're also attached to the GitHub release as assets.

## How to upload (the honest bit)

Uploading needs **your** Google/YouTube account. Two paths:

1. **Manual (recommended, 2 min each):** [studio.youtube.com](https://studio.youtube.com) → *Create → Upload videos* → drag the `.mp4` → paste the title/description/tags below → set visibility. Done.
2. **Automated:** the YouTube Data API v3 (or the `youtube-upload` CLI) with an OAuth client you own. It requires a Google Cloud project + a one-time browser consent — an interactive step that has to be run by you. Happy to write the upload script if you set up the OAuth client and share the (git-ignored) `client_secret.json`.

Thumbnail: any frame works well (e.g. the `AI + React vs AI + Mateu` slide or a terminal scene) — grab one with `ffmpeg -ss <sec> -i out/explainer.mp4 -frames:v 1 thumb.png`.

---

## Explainer (EN) — `explainer.mp4`

**Title:** Your UI is data — so AI can operate AND write your apps (Mateu)

**Description:**
```
Every team building internal software builds the UI by hand, screen after screen. Mateu asks a different question: what if the UI were just data?

Declare the model once — and Mateu renders web, native and static. And because the UI is self-describing data, it isn't only something a renderer turns into pixels — it's something an AI agent can OPERATE and even AUTHOR.

• Operate: every Mateu app is also an MCP server — any agent can discover and run its screens, with permissions enforced on the server (RBAC, not theater). Shown live: an LLM reads 47 real bookings and drives the UI itself.
• Author: because Mateu publishes JSON Schemas for the UI, an LLM writes the definition — validated mechanically against the contract, with a repair loop. Shown live: the model authors a valid routes file on the first try.

Honest scope: runtime operability is shipped and verified across Java/.NET/Python; prompt-to-app is a working proof of concept.

Open source · Apache 2.0 · https://mateu.io
Docs: https://mateu.io  ·  GitHub: https://github.com/miguelperezcolom/mateu

Chapters:
0:00 The UI problem
0:13 Declare the model once
0:29 Two planes over one contract
0:40 Operate — every app is an MCP server
0:54 RBAC on the server
1:05 Live: the agent operates the app
1:18 Author — the LLM writes the UI
1:29 AI + React vs AI + Mateu
1:42 Live: the LLM authors the UI
1:52 Recap
2:08 Define your UI once
```

**Tags:** `Mateu, MCP, Model Context Protocol, AI agents, low-code, model-driven UI, prompt to app, LLM, Java, .NET, Python, developer tools, internal tools, open source`

---

## Teaser (EN) — `teaser.mp4`

**Title:** Your UI is data. So AI can operate — and write — your apps. (Mateu)

**Description:**
```
Every Mateu app is also an MCP server, so any AI agent can operate it (live: an LLM reads 47 real bookings and drives the UI). And because Mateu publishes a schema for the UI, an LLM can write it too — valid on the first try. Small, reviewable, verifiable — not thousands of lines of AI-generated code.

Define your UI once. Let humans and agents build the rest.
Open source · https://mateu.io
```
**Tags:** same as the explainer.

---

## Explainer (ES) — `explainer-es.mp4`

**Título:** Tu interfaz es un dato — la IA puede operar Y escribir tus apps (Mateu)

**Descripción:**
```
Todo equipo que hace software interno construye la interfaz a mano, pantalla tras pantalla. Mateu se hace otra pregunta: ¿y si la interfaz fuera solo datos?

Declara el modelo una vez — y Mateu renderiza web, nativo y estático. Y como la interfaz es un dato que se describe a sí mismo, no es solo algo que se convierte en píxeles: es algo que un agente de IA puede OPERAR e incluso ESCRIBIR.

• Operar: cada app Mateu es también un servidor MCP — cualquier agente descubre y ejecuta sus pantallas, con permisos aplicados en el servidor (RBAC, sin teatro). En vivo: un modelo lee 47 reservas reales y mueve la interfaz él solo.
• Autorar: como Mateu publica esquemas JSON para la interfaz, un modelo escribe la definición — validada de forma mecánica contra el contrato, con bucle de reparación. En vivo: el modelo escribe un fichero de rutas válido a la primera.

Alcance honesto: la operabilidad en runtime está disponible y verificada en Java/.NET/Python; prompt-to-app es una prueba de concepto que funciona.

Código abierto · Apache 2.0 · https://mateu.io

Capítulos:
0:00 El problema de la interfaz
0:13 Declara el modelo una vez
0:29 Dos planos sobre un contrato
0:40 Operar — cada app es un servidor MCP
0:54 Permisos en el servidor
1:05 En vivo: el agente opera la app
1:18 Autorar — el modelo escribe la interfaz
1:29 IA + React vs IA + Mateu
1:42 En vivo: el modelo escribe la interfaz
1:52 Resumen
2:07 Define tu interfaz una vez
```
**Tags:** `Mateu, MCP, agentes IA, low-code, UI dirigida por modelo, prompt to app, LLM, Java, .NET, Python, herramientas para desarrolladores, código abierto`

---

## Teaser (ES) — `teaser-es.mp4`

**Título:** Tu interfaz es un dato. La IA puede operar — y escribir — tus apps. (Mateu)

**Descripción:**
```
Cada app Mateu es también un servidor MCP, así que cualquier agente puede operarla (en vivo: un modelo lee 47 reservas reales y mueve la interfaz). Y como Mateu publica un esquema para la interfaz, un modelo también puede escribirla — válido a la primera. Pequeño, revisable, verificable — no miles de líneas de código generado por IA.

Define tu interfaz una vez. Deja que humanos y agentes construyan el resto.
Código abierto · https://mateu.io
```

> Chapter timestamps are a guide (rounded from the English render); the Spanish cut is ~1s shorter, so
> nudge them in Studio if you want them exact.
