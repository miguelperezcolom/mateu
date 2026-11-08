package io.mateu.explorer.examples.components.form;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The same page in Java: a fluent {@link Form} with its header (overline, title, subtitle,
 * timestamp, badges, KPIs, toolbar) over a FormLayout. The toolbar button runs its own handler.
 */
public class BookingPage implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return Form.builder()
        .overline("Reservations")
        .title("Booking HB-20431")
        .subtitle("Lucía Fernández · 3 nights · Deluxe sea view")
        .timestamp("Last updated 8 Nov 2026, 10:42")
        .badge(new Chip("Confirmed", "success"))
        .badge(new Chip("Prepaid", "contrast"))
        .kpi(new Fact("Arrival", "14 Nov 2026"))
        .kpi(new Fact("Total", "€ 1,284.00"))
        .toolbarItem(
            Button.builder()
                .label("Send confirmation")
                .actionId("sendConfirmation")
                .buttonStyle(ButtonStyle.primary)
                .callable(() -> Message.success("Confirmation sent to lucia.fernandez@example.com"))
                .build())
        .contentItem(
            FormLayout.builder()
                .maxColumns(2)
                .content(
                    List.of(
                        FormField.builder().id("guest").label("Guest").initialValue("Lucía Fernández").build(),
                        FormField.builder().id("adults").label("Adults").initialValue(2).build()))
                .build())
        .build();
  }
}
