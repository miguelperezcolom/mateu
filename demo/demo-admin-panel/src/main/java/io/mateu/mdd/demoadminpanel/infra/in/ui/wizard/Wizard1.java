package io.mateu.mdd.demoadminpanel.infra.in.ui.wizard;


import io.mateu.core.infra.declarative.orchestrators.wizard.WizardOrchestrator;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.WizardCompletionAction;

@Style(StyleConstants.CONTAINER)
public class Wizard1 extends WizardOrchestrator {

    Step1 step1;

    Step2 step2;

    Step3 step3;

    @WizardCompletionAction
    void complete() {
        System.out.println("Wizard completed");
    }
}
