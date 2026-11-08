# inline-form-rules

A page (`InlineFormRules`) whose own `@Disabled reference` sits beside an `@Inline` nested object
(`contact`, a `ContactInfo`) whose fields carry `@Hidden("state.reference == 'internal'")` and
`@Disabled`.

What it pins (Java's `RuleMapper.createRules`, which reads the VIEW class's fields):

- the page's own field gets its client rule (`reference` disabled);
- the nested object's fields — drawn as `contact-phone` / `contact-email` — get NO client rule,
  neither under their prefixed ids nor under their own names. The ports used to disagree here in
  the report that led to this case; the three servers agree: nested rules are not emitted.
