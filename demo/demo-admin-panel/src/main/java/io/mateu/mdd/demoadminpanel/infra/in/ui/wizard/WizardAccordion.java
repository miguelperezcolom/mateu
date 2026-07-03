package io.mateu.mdd.demoadminpanel.infra.in.ui.wizard;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardLayout;
import io.mateu.uidl.annotations.WizardLayoutMode;

/**
 * Accordion wizard: each step is a collapsible panel. The current step is open; completed steps are
 * collapsed but can be expanded to review; upcoming steps are disabled.
 */
@Style(StyleConstants.CONTAINER)
@Title("Accordion wizard")
@WizardLayout(WizardLayoutMode.ACCORDION)
public class WizardAccordion extends Wizard {

    Step1 step1;
    Step2 step2;
    Step3 step3;
    Wizard1Result result;

    @WizardCompletionAction
    void complete() {
        result = new Wizard1Result();
        result.msg = "Hola " + step1.name() + ", " + step2.age() + ", " + step3.happy() + "!";
    }
}
