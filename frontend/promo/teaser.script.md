# Mateu — the agent-operability plane · TEASER script (~45–60s, English)

Punchy social cut. Draft video: `out/teaser.mp4`.

| # | On screen | Voiceover | ~sec |
|---|---|---|---|
| 1 | "Your UI is **data**. Watch what that unlocks." | Your UI is data. Watch what that unlocks. | 3 |
| 2 | *Agents operate your app* — **LIVE** terminal: `mateu_search` → `navigation-requested` → "47 bookings". | Every Mateu app is also an MCP server, so any AI agent can operate it. We told a live LLM: list the bookings. It read forty-seven real records, and drove the UI itself. | 12 |
| 3 | *Agents author your app* — **LIVE** terminal: the real `{type:Routes, routes:[bookings, customers]}` + "valid… first attempt". | And because Mateu publishes a schema for the UI, an LLM can write it too. Create a routes file with two screens. The model authored this — valid against the published schema, first try. | 12 |
| 4 | *Why it matters* — "Small. Reviewable. Verifiable." | Small, reviewable, verifiable — not thousands of lines of AI-generated code nobody reads. The framework supplies the behavior, the accessibility, the security. | 11 |
| 5 | *CTA* — **Mateu** · "Define once. Humans and agents build the rest." mateu.io | Define your UI once. Let humans and agents build the rest. Mateu — open source. | 6 |

**Note:** the two terminal scenes show the REAL captured output (a live LLM authoring UIDL / operating a
Mateu app), not mock-ups.
