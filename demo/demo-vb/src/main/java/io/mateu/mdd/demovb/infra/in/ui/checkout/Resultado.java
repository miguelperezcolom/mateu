package io.mateu.mdd.demovb.infra.in.ui.checkout;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.PlainText;

/** Último paso = pantalla de resultado (solo lectura) tras la acción de completado. */
@PlainText
public class Resultado implements WizardStep {

  public String msg;
}
