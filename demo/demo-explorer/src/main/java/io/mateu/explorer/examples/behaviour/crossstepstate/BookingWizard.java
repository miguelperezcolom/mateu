package io.mateu.explorer.examples.behaviour.crossstepstate;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardCompletionAction;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * Every step's values travel with the wizard: going back shows what you typed, going forward keeps
 * it, and the completion action reads them all — no mirror fields, no session. (The server keeps no
 * state between requests: it all rides the request.)
 */
@Title("Room booking")
public class BookingWizard extends Wizard {

  public enum Room {
    SINGLE,
    DOUBLE,
    SUITE
  }

  public static class Guest implements WizardStep {
    @NotEmpty public String name;
  }

  public static class Stay implements WizardStep {
    @NotNull public Room room = Room.DOUBLE;
    @NotNull public Integer nights = 2;
  }

  public static class Extras implements WizardStep {
    public boolean breakfast;
  }

  public static class Confirmation implements WizardStep {
    @PlainText public String summary;
  }

  Guest guest = new Guest();
  Stay stay = new Stay();
  Extras extras = new Extras();
  Confirmation confirmation;

  @WizardCompletionAction
  @Action(validationRequired = true)
  @Label("Book")
  Object book() {
    confirmation = new Confirmation();
    confirmation.summary =
        guest.name
            + ": "
            + stay.nights
            + " nights in a "
            + stay.room.name().toLowerCase()
            + " room"
            + (extras.breakfast ? ", breakfast included." : ", no breakfast.");
    return null;
  }
}
