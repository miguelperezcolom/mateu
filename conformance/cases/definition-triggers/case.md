# definition-triggers

Pins a DEFINITION-ONLY page (a route with a `layout:` and no view model, served from this case's
own `specs/ui/`) that declares `triggers:` beside its layout — a classless page firing actions
without a click (Java's `SeededYamlPage` as a `TriggersSupplier`).

What it pins:

- a page declaring triggers (and nothing else: no actions, no seeds, no page type) is still WRAPPED
  in a server-side component — a bare layout carries no triggers;
- every member of the Trigger family travels as Java's `TriggerMapper` emits it, in declaration
  order: `OnLoadTrigger` (times, timeoutMillis, condition, background), `OnCustomEventTrigger`
  (DOCUMENT; COMPONENT with `from` and a condition), `OnValueChangeTrigger`, `OnSuccessTrigger`,
  `OnErrorTrigger` and `AutoSaveTrigger` (its `debounceMillis` kept, a meaningful zero);
- an `OnCustomEventTrigger` with no `source:` listens on itself (`SELF`) — the record's own default,
  NOT the `DOCUMENT` a class's `@SubscribeTo` defaults to;
- triggers alone advertise no action (the page claims nothing it does not declare).

The three runners render it with their specs directory pointed at `specs/ui/` here (a case with a
`specs/` directory is a YAML case) and the request in `request.json`.
