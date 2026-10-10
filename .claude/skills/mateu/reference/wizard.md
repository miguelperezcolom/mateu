# Mateu wizard

A multi-step flow: `extends Wizard`. Each **field whose type implements `WizardStep`**
is a step, in declaration order. A `@WizardCompletionAction` method is the button on
the step before the result.

```java
@UI("/registration")
@Title("Registration Wizard")
public class RegistrationWizard extends Wizard {

    PersonalStep personal = new PersonalStep();
    AddressStep  address  = new AddressStep();
    ResultStep   result;                       // filled in on completion

    @WizardCompletionAction
    public Message complete() {
        result = new ResultStep();
        result.setSummary("Welcome, " + personal.getName() + " from " + address.getCity() + "!");
        return new Message("Registration complete!");
    }

    @Getter @Setter
    public static class PersonalStep implements WizardStep {
        @NotEmpty String name;
        @NotEmpty @Email String email;
    }

    @Getter @Setter
    public static class AddressStep implements WizardStep {
        @NotEmpty String street;
        @NotEmpty String city;
    }

    @Getter @Setter @PlainText           // read-only result screen
    public static class ResultStep implements WizardStep {
        String summary;
    }
}
```

Notes:
- Step order = field declaration order.
- Validation per step uses Bean Validation on the step's fields; Mateu blocks "Next"
  until the current step is valid.
- The result/summary step is typically `@PlainText` (display only) and is initialised
  inside the `@WizardCompletionAction` method, not at construction.
- Lombok `@Getter/@Setter` on step classes is the usual style; plain getters/setters
  work too.

## Streamed completion (progress while it runs)

A `@WizardCompletionAction` may return a `Flux` — typically a `LongTask` — to show live
progress; once the stream ends the wizard lands on the result step, exactly like a `null`
return. Build the result step inside the work (it is rendered after the stream is over).
If the stream emits `Message.error(...)`, the wizard stays on the step instead.

```java
@WizardCompletionAction
Flux<?> run() {
    if (!cashiers.closeAll) return Flux.just(Message.error("Close the open cashiers first."));
    return LongTask.create("Running end of day").withProgressBar()
        .run(progress -> Flux.fromIterable(steps).map(s -> {
            var line = s.run();
            if (s.isLast()) { result = new ResultStep(); result.lines = lines; }
            return progress.step(line, s.fraction());
        }));
}
```

## Branching (conditional steps)

Override `stepApplies(String stepFieldName)` to skip steps based on earlier answers. Skipped
steps are jumped in both directions, excluded from the progress bar, and left out of the
accordion/recap layouts. The result step always applies; if the penultimate step is skipped,
the completion button moves to the last applicable step automatically.

```java
@Override
protected boolean stepApplies(String stepFieldName) {
    if ("company".equals(stepFieldName)) return account.accountType == AccountType.COMPANY;
    return true;
}
```
