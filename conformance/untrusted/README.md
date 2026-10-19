# Untrusted definitions

A screen an AGENT authored (the chat's `render-screen`, a live `AgentPush` of kind `render`) is
untrusted: an LLM can be steered by the data it reads. Every shell renders it through `__preview__`
with `_untrusted: true`, and what comes back must hold nothing that can run script in the user's tab.

`cases.json` pins the rules on wire JSON (`input` → `expected`). Five implementations run it:

| Implementation | Code | Test |
|---|---|---|
| Java (reference) | `core/.../runaction/UntrustedDefinition.java` | `UntrustedPreviewSyncTest` |
| .NET | `Mateu.Core/UntrustedDefinition.cs` | `UntrustedPreviewTests` |
| Python | `mateu_ui/core/untrusted.py` | `test_untrusted_preview.py` |
| Web (libs/mateu) | `infra/ui/untrustedDefinition.ts` | `untrustedDefinition.test.ts` |
| Redwood | `poc/untrusted.mjs` | `test-security.mjs` |

The browsers apply the rules again on what they paint: a static bundle expands a JSON screen
locally, and an older backend ignores the flag. A case is added here first; an implementation that
disagrees is fixed, the case is not changed to match it.
