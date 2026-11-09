# wizard-completion-error

**Pins (a second request: the completion from the penultimate step)** a wizard completion that
answers an error `Message`: the completion did not happen, so the answer is the message alone — no
fragment, the wizard stays on its step (Java's `WizardActionDispatcher`; only a null or a
non-error `Message` lands on the result step). Python's `@wizard_completion_action` returns the
message; .NET's completion (`OnNext`) answers nothing, so its fixture refuses through
`BeforeStepNavigate`, which every completion passes and whose answer becomes the response. The
request carries both positions (`position` for Java, `__step` for the ports); each server reads its
own.
