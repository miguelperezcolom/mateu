package io.mateu.redwoodvb.ui;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;

/** Fase 8 — a guided process (Wizard) rendered as the authentic oj-sp-guided-process. */
@UI("/wizard")
@Title("Nueva reserva")
@WizardProgress(WizardProgressStyle.STEPS)
public class BookingWizard extends Wizard {

  DatosStep datos;
  EstanciaStep estancia;
  Resultado resultado;

  @WizardCompletionAction
  void completar() {
    resultado = new Resultado();
    resultado.resumen =
        "Reserva de " + datos.nombre() + " · " + estancia.noches() + " noches (" + estancia.tipoHabitacion() + ").";
  }

  public record DatosStep(String nombre, String email) implements WizardStep {}

  public record EstanciaStep(int noches, String tipoHabitacion) implements WizardStep {}

  @ReadOnly
  public static class Resultado implements WizardStep {
    String resumen = "Listo";
  }
}
