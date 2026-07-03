package io.mateu.mdd.demoadminpanel.infra.in.ui.wizard;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardLayout;
import io.mateu.uidl.annotations.WizardLayoutMode;

/**
 * Accumulative wizard: the current step is editable, with a read-only recap of the completed steps
 * stacked above it.
 */
@Style(StyleConstants.CONTAINER)
@Title("Accumulative wizard")
@WizardLayout(WizardLayoutMode.ACCUMULATIVE)
public class WizardAccumulative extends Wizard {

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
