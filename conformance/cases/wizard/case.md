# wizard

Pins the first step of a three-step wizard with a completion action (Sign up: a required email, a
number of seats, and the read-only result step): the `h2` heading, the progress bar (`value` = the
steps already done — 0 here —, `max` = every step, the current step's title as its `text`), the
step's form as the regular section card under a spacer `Div`, the client validation of ONLY the
current step's constraints, the buttons right-aligned (no Back on the first step — there is nowhere
to go back to —, Next as the primary call to action), the component-tree envelope style and the
`process` page type.

## What it does not pin

The wizard's PROTOCOL, structurally different and recorded as an idiom in `reference/parity.md`:
Java's wizard is a mediator that advertises a `*` catch-all and keeps its position in its own
state; the ports list `next`/`back`/`skip`/the completion and keep `__step` in the state. So the
component's `actions` and the fragment's `initialData`/`state` are left out on every side, exactly
as for the mediated CRUD cases. Step names are another idiom: Java names a step after its field,
the ports number them, so the port fixtures give the same titles through their `StepTitle(n)` /
`step_title(n)` hook.
