package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@UI("/wizard")
@Title("Registration Wizard")
public class RegistrationWizard extends Wizard {

    PersonalStep personal = new PersonalStep();

    AddressStep address = new AddressStep();

    ResultStep result;

    @WizardCompletionAction
    public Message complete() {
        result = new ResultStep();
        result.setSummary("Welcome, " + personal.getName() + " from " + address.getCity() + "!");
        return new Message("Registration complete!");
    }

    @Getter
    @Setter
    public static class PersonalStep implements WizardStep {
        @NotEmpty
        String name;
        @NotEmpty
        String email;
    }

    @Getter
    @Setter
    public static class AddressStep implements WizardStep {
        @NotEmpty
        String street;
        @NotEmpty
        String city;
    }

    @Getter
    @Setter
    @PlainText
    public static class ResultStep implements WizardStep {
        String summary;
    }

}
