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
