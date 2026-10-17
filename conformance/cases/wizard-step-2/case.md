# wizard-step-2

Pins the wizard's SECOND step (`request.json`: `actionId: next` from the first step with its
required email filled in): the progress bar one step on ("Plan", value 1 of 3), the plan step's
form, and the navigation bar with Back and the completion button ("Sign up", dispatching
`signUp`) instead of Next — the penultimate step is where the completion lives.

Like the `wizard` case, the wizard's `actions` and its `initialData`/`state` are left out on every
side (Java's wizard is a mediator with a `*` catch-all and keeps its position in its own state; the
ports list their actions and keep `__step`). The request carries only the step's field, which every
server reads (Java hydrates the current step from the state; the ports start from step 1). The
completion's action id is the `@WizardCompletionAction` method's name in Java, `snake_case →
camelCase` of the `@wizard_completion_action` method in Python, and `Wizard.CompletionActionId` in
.NET (whose completion is the `Complete()` override, not a named method).
