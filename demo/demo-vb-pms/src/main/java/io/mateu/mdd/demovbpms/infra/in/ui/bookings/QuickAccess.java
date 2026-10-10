package io.mateu.mdd.demovbpms.infra.in.ui.bookings;

import io.mateu.mdd.demovbpms.infra.in.ui.financials.Billing;
import io.mateu.mdd.demovbpms.infra.in.ui.frontdesk.RegistrationCard;
import io.mateu.mdd.demovbpms.infra.in.ui.frontdesk.TelephoneConsole;
import io.mateu.mdd.demovbpms.infra.in.ui.inventory.FloorPlan;
import io.mateu.uidl.annotations.Icon;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.interfaces.IconKey;

/**
 * A menu group shown as CARDS (@Menu(display = cards) on the field that holds it): each entry is
 * a card with its description and icon; an entry with its own entries shows them as actions.
 */
public class QuickAccess {

  @Menu(description = "Sign the registration card and scan the ID")
  @Icon(IconKey.Clipboard)
  RegistrationCard checkIn;

  @Menu(description = "In-house guests and their details, side by side")
  @Icon(IconKey.Phone)
  TelephoneConsole telephone;

  @Menu(description = "Rooms coloured by housekeeping status")
  @Icon(IconKey.Building)
  FloorPlan floorPlan;

  @Menu(description = "Folios, charges and payments")
  @Icon(IconKey.Invoice)
  BillingActions billing;

  public static class BillingActions {
    @Menu Billing folio;

    @Menu NewReservation newReservation;
  }
}
