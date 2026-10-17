# rejected-save

Pins the server-side re-check of a validated form (`request.json`: `actionId: save` with the
required `name` empty). The `save` button is advertised `validationRequired`, so a browser would
not have sent it — the server must refuse it all the same, with the client's own messages: one
sticky error toast titled "There are validation errors" listing "• Name: Cannot be empty". Nothing
else changes on screen (no fragments).

Java's `ServerConstraintCheck`, Python's `form_violations` and .NET's `ReflectionMapper.Violations`
produce it; in the ports the refusal is raised as a user-facing error and answered by the adapter's
error boundary, which the runners apply exactly as the HTTP adapter does.
