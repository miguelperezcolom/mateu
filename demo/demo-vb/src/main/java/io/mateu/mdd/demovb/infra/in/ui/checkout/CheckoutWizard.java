package io.mateu.mdd.demovb.infra.in.ui.checkout;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;

/**
 * Fase 8 (Guided process): wizard de 3 pasos + resultado; el penúltimo paso muestra el botón de
 * completado. STEPS → ProgressSteps en el wire (bullets), que el renderer VB mapea al
 * oj-sp-guided-process.
 */
@UI("/checkout")
@Title("Checkout")
@WizardProgress(WizardProgressStyle.STEPS)
public class CheckoutWizard extends Wizard {

  Cliente cliente;

  Envio envio;

  Pago pago;

  Resultado resultado;

  @WizardCompletionAction
  void confirm() {
    resultado = new Resultado();
    resultado.msg =
        "Pedido confirmado para "
            + cliente.name()
            + " · envío a "
            + envio.address()
            + " ("
            + envio.city()
            + ")";
  }
}
