package io.mateu.explorer.examples.components.headers;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.HeroSection;
import io.mateu.uidl.data.HeroTone;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * An EntityHeader whose phone fact carries an action (an icon button after the value runs {@code
 * callGuest}) and a HeroSection with a button that runs its own handler.
 */
public class FluentHeaders implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                EntityHeader.builder()
                    .title("Lucía Fernández")
                    .subtitle("Booking HB-20431 · 14 → 17 Nov 2026")
                    .badges(List.of(new Chip("Gold member", "success")))
                    .facts(
                        List.of(
                            new Fact("Room", "102"),
                            Fact.builder().label("Phone").value("+34 600 123 456").icon("vaadin:phone").actionId("callGuest").build()))
                    .metricLabel("Balance")
                    .metricValue("€ 1,034.00")
                    .metricCaption("Due at check-out")
                    .build(),
                HeroSection.builder()
                    .overline("Winter 2026")
                    .title("Stay three nights, pay two")
                    .subtitle("Every weekend from December to February")
                    .tone(HeroTone.pine)
                    .centered(true)
                    .content(
                        List.of(
                            Button.builder()
                                .label("Book the offer")
                                .actionId("bookOffer")
                                .buttonStyle(ButtonStyle.primary)
                                .callable(() -> Message.success("Offer 3x2 added to the booking"))
                                .build()))
                    .build()))
        .build();
  }

  public Message callGuest() {
    return new Message("Calling +34 600 123 456…");
  }
}
