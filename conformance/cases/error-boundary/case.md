# error-boundary

Pins the error boundary (`request.json`: `actionId: explode`, an action that throws an unexpected
exception whose message names a host). The user is told "Something went wrong / An unexpected
error occurred. Reference: <ref>" in a sticky error toast — never the exception, its message or a
stack trace. The reference is the per-request log key (a 12-character id in Java and Python, the
request's correlation id in .NET), so the three normalisers mask it as `Reference: <ref>`; the text
around it is pinned.

Java applies the boundary in `RunActionUseCase`; .NET (`MateuErrors`) and Python
(`mateu_core.errors`) apply it in the HTTP adapter, and their runners wrap the handler the same way.
