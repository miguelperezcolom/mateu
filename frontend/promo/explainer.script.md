# Mateu — the agent-operability plane · EXPLAINER script (~2.5 min, English)

Production-ready script. The draft video (`out/explainer.mp4`) renders these scenes with slides +
synthesized voice; for a polished cut, swap in a human voice and motion graphics, keep the copy.

| # | On screen | Voiceover | ~sec |
|---|---|---|---|
| 1 | *The UI problem* — "You design the UI. Then you build it by hand. Screen after screen." | Every team building internal software hits the same wall: the user interface. You design it, then you build it by hand, screen after screen. Mateu asks a different question — what if the UI were just **data**? | 13 |
| 2 | *One idea* — "Declare the model once." (code `@UI` / data YAML) | In Mateu you declare the model once. Fields, forms, listings, navigation — as a definition, not as code. From that one definition Mateu renders web, native and static. But here's the part that changes everything in the age of AI. | 16 |
| 3 | *Why it matters now* — "Self-describing data isn't just for pixels. It's for agents." Two planes over one contract. | Because the UI is self-describing data, it isn't only something a renderer turns into pixels — it's something an agent can read, and even write. That's a whole second plane, on the same contract. | 12 |
| 4 | *Half one · operate* — "Every app is also an MCP server." tool list | Every Mateu app is now also an MCP server. One endpoint turns each screen into tools any agent can discover and run: list the routes, describe a screen's fields and actions, run an action, search a listing. | 13 |
| 5 | *Safe by construction* — "RBAC on the server. Not theater." | And it's safe by construction. Permissions are enforced on the server, over the user's token. A field or action a caller may not touch never even reaches the agent. No security theater. | 11 |
| 6 | **LIVE** terminal — agent operates a booking app: `mateu_search` → `navigation-requested /booking/bookings` → "47 bookings". | This is real. We pointed a live LLM agent at a Mateu booking app and said: list the bookings. It called the tools, read forty-seven real records, and drove the UI to the bookings screen — on its own. | 13 |
| 7 | *Half two · author* — "The LLM can write the UI." prompt → definition → validate → repair | The other half is authoring. Because the UI is data and Mateu publishes JSON Schemas for it, an LLM can write the definition — and the output is checked mechanically against the contract. | 12 |
| 8 | *Why it's different* — AI+React (thousands of lines) vs AI+Mateu (a small, schema-validated definition) | That's the difference from letting an AI generate React. The AI emits a small, reviewable definition, validated against a schema, repaired if it's wrong — not thousands of lines of code nobody reads. | 12 |
| 9 | **LIVE** terminal — prompt-to-app: the real `{type:Routes, routes:[bookings, customers]}` + "valid… first attempt". | Again, real. Create a routes file with two screens. A live LLM wrote this definition, and it passed the published schema on the first try. The LLM authored the UI. | 11 |
| 10 | *The whole thing* — operate (shipped, Java/.NET/Python, RBAC) · author (prompt-to-app, PoC) | One idea, two consequences. The UI is data — so agents can operate your apps, and help write them. Runtime operability, shipped across Java, .NET and Python. Prompt-to-app, a working proof of concept. | 15 |
| 11 | *CTA* — **Mateu** · "Define your UI once. Let humans and agents build the rest." Apache 2.0 · mateu.io | Mateu. Define your UI once. Let humans and agents build the rest. Open source, Apache two point zero. | 8 |

**Honesty guardrail (matches the docs/ADR):** runtime operability is *shipped and verified*; prompt-to-app
is a *proof of concept* (spike/beta). Don't oversell #7–#9 as GA.
