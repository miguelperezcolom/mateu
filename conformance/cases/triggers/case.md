# triggers

**Pins:** every trigger kind a view declares, ported to .NET (`[Trigger]`, `[SubscribeTo]`) and
Python (`@trigger`, `@subscribe_to`) in 3.0-alpha.426: an `OnLoad` refresh repeating every
`timeoutMillis` with `times = 0` (unbounded) and `background` — the periodic refresh —,
`OnSuccess` and `OnError` of another action (`calledActionId`: chained actions), `OnValueChange`
of one field (`propertyName`), and a subscription on the global bus (`OnCustomEvent` with
`eventName` and `source: DOCUMENT`). Also pins that the actions the triggers name are
advertised, in declaration order, so the client sends them.

Worth pinning because the ports used to emit only `OnLoad`/`AutoSave`/`OnCustomEvent`, and their
`OnCustomEvent` carried the event as `event` — a member no renderer reads — so a port's
subscription listened to nothing.
