package io.mateu.mdd.demoadminpanel.infra.in.ui.wizard;


import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.WizardCompletionAction;

@Style(StyleConstants.CONTAINER)
public class Wizard1 extends Wizard {

    Step1 step1;

    Step2 step2;

    Step3 step3;

    Wizard1Result result;

    @WizardCompletionAction
    void complete() {

        result = new Wizard1Result(); // at this point, result does not exist yet
        result.msg = "Hola " + step1.name() + ", " + step2.age() + ", " + step3.happy() + "!";

        System.out.println("Wizard completed");
    }
}
