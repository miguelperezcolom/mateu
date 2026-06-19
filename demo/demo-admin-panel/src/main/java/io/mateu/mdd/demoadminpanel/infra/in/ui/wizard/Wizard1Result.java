package io.mateu.mdd.demoadminpanel.infra.in.ui.wizard;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.ReadOnly;

@ReadOnly
public class Wizard1Result implements WizardStep {
    String msg = "Hola!";
}
