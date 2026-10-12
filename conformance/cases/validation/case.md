# validation

Pins how declared constraints reach the wire: @NotEmpty/@NotNull ([Required]/Required()) must surface as the FormField's `required` flag, and every constraint must surface as a component-level `validations` entry (ValidationDto: fieldId + client-side condition + message, built by ConstraintValidationMapper). This is what makes client-side validation backend-driven — a renderer refuses to submit based solely on what the wire says, so a server that drops a constraint silently ships a form that accepts invalid data.

The conditions follow Bean Validation's reading (2026-10-12): a required field holds a value — `0` and `false` are values, `''`, an absent key and an empty list are not — and an absent value satisfies @Min/@Max/@Pattern (requiring it is @NotNull's job). The old conditions (`state['x']`, `state['x'] >= 18`) rejected a required count of 0 and an optional bounded field left empty.

The three servers also re-check the same constraints server-side before an action advertised `validationRequired` (Java's ServerConstraintCheck, Python's `form_violations`, .NET's `ReflectionMapper.Violations`), with the client's own messages; that leg is pinned by each server's suite (ServerSideValidationSyncTest / test_validation.py / ServerSideValidationTests), not by this wire case.
