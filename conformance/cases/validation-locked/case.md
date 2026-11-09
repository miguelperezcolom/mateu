# validation-locked

**Pins:** constraints on fields the user cannot type into. A field-level `@ReadOnly`
(`[ReadOnly]` / `ReadOnly()`) field carries `readOnly: true` AND still sends its constraints, and so
does a `@PlainText` field (stereotype `plainText`): Java's `PageFormBuilder.rendersAsInput` drops
hidden / hidden-in / non-rendered fields, not locked ones — the locked value travels pre-filled. The
server re-checks the same fields (`ServerConstraintCheck`).

Open owner question: whether the reference should skip locked fields (a constraint the user cannot
fix would block the submit). Until it is decided the ports follow Java.
