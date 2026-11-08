package io.mateu.explorer.examples.components.pickers;

import io.mateu.uidl.data.AddOn;
import io.mateu.uidl.data.AddOnPicker;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.PaymentMethod;
import io.mateu.uidl.data.PaymentPicker;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Two front-office pickers. The {@link AddOnPicker} toggles priced extras in the browser (the total
 * recomputes live) and, on every toggle, runs its {@code actionId} with {@code _item}, {@code
 * _added} and {@code _total}. The {@link PaymentPicker} switches methods in the browser and only
 * talks to the server on confirm: its {@code actionId} runs with {@code _method}.
 */
public class TicketExtras implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                AddOnPicker.builder()
                    .totalLabel("Extras")
                    .currency("€")
                    .actionId("extrasChanged")
                    .items(
                        List.of(
                            addOn("audio", "🎧", "Audio guide", "In 12 languages", 4.5, "per person", false),
                            addOn("tour", "🧑‍🏫", "Guided tour", "60 minutes, 11:00 or 16:00", 9.0, "per person", true),
                            addOn("cloak", "🧥", "Cloakroom", "One coat or bag", null, null, false),
                            addOn("cafe", "☕", "Café voucher", "Coffee and a pastry", 6.0, null, false)))
                    .build(),
                PaymentPicker.builder()
                    .actionId("pay")
                    .methods(
                        List.of(
                            new PaymentMethod("card", "Card"),
                            new PaymentMethod("cash", "Cash"),
                            new PaymentMethod("member", "Member credit")))
                    .selected("card")
                    .contextLabel("To pay")
                    .contextValue("€ 47.00")
                    .confirmLabel("Charge")
                    .build()))
        .build();
  }

  static AddOn addOn(String id, String icon, String title, String description, Double price, String unit,
      boolean added) {
    return AddOn.builder()
        .id(id)
        .icon(icon)
        .title(title)
        .description(description)
        .price(price)
        .unit(unit)
        .includedLabel(price == null ? "Included" : null)
        .added(added)
        .build();
  }

  public Message extrasChanged(HttpRequest httpRequest) {
    var p = httpRequest.runActionRq().parameters();
    return new Message(
        (Boolean.TRUE.equals(p.get("_added")) ? "Added " : "Removed ") + p.get("_item") + " — total " + p.get("_total") + " €");
  }

  public Message pay(HttpRequest httpRequest) {
    return Message.success("Charged by " + httpRequest.runActionRq().parameters().get("_method"));
  }
}
