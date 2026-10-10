package io.mateu.mdd.demovbpms.infra.in.ui.bookings;

import io.mateu.uidl.annotations.Disabled;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.interfaces.RuleSupplier;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.util.List;

/**
 * New reservation (OPERA Cloud 26.3 user guide, 003 "Using Look to Book Sales Screen": "arrival,
 * nights and departure linked"). Linked fields recomputed without saving (@Trigger OnValueChange →
 * server action), and fields shown, hidden or enabled from others in the browser (@Hidden(expr),
 * @Disabled(expr) and a RuleSupplier).
 */
@UI("/new-reservation")
@Title("New reservation")
@Trigger(type = TriggerType.OnValueChange, propertyName = "arrival", actionId = "recalculate")
@Trigger(type = TriggerType.OnValueChange, propertyName = "nights", actionId = "recalculate")
public class NewReservation implements RuleSupplier {

  public enum Guarantee {
    NONE,
    CREDIT_CARD,
    DEPOSIT,
    COMPANY
  }

  @Section("Stay")
  @NotEmpty
  String guest = "";

  LocalDate arrival = LocalDate.of(2026, 10, 12);

  @Min(1)
  int nights = 2;

  @Label("Departure (calculated)")
  LocalDate departure = LocalDate.of(2026, 10, 14);

  @Section("Guarantee")
  @Stereotype(FieldStereotype.radio)
  Guarantee guarantee = Guarantee.NONE;

  @Hidden("state.guarantee != 'CREDIT_CARD'")
  String cardNumber;

  @Disabled("state.guarantee != 'COMPANY'")
  String company;

  boolean vip;

  @Label("VIP notes")
  String vipNotes;

  public Object recalculate() {
    if (arrival != null && nights > 0) departure = arrival.plusDays(nights);
    return this;
  }

  @Override
  public List<Rule> rules() {
    // VIP notes only make sense for a VIP: hidden otherwise, from a RuleSupplier
    return List.of(
        new Rule(
            "!state.vip",
            RuleAction.SetDataValue,
            "vipNotes",
            RuleFieldAttribute.hidden,
            true,
            null,
            null,
            RuleResult.Continue),
        new Rule(
            "state.vip",
            RuleAction.SetDataValue,
            "vipNotes",
            RuleFieldAttribute.hidden,
            false,
            null,
            null,
            RuleResult.Continue));
  }

  @Toolbar
  public Message book() {
    return new Message(
        "Booked " + guest + " " + arrival + " → " + departure + " (" + nights + " nights), "
            + guarantee + (cardNumber != null ? " card " + cardNumber : ""));
  }
}
