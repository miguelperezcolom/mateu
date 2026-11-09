package io.mateu.explorer.examples.components.card;

import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CardVariant;
import io.mateu.uidl.data.Details;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Popover;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.Tooltip;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** A Card with a footer button that runs, a Details, a Tooltip and a Popover — in Java. */
public class FluentCard implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .content(
            List.of(
                Card.builder()
                    .variants(List.of(CardVariant.outlined))
                    .style("width: 18rem;")
                    .title(new Text("Junior suite"))
                    .subtitle(new Text("48 m² · lounge"))
                    .headerSuffix(new Badge("€ 440"))
                    .content(new Text("Bay views on two sides."))
                    .footer(
                        Button.builder()
                            .label("Hold for 24 h")
                            .actionId("holdSuite")
                            .buttonStyle(ButtonStyle.primary)
                            .callable(() -> Message.success("Junior suite held until tomorrow 12:00"))
                            .build())
                    .build(),
                Details.builder()
                    .summary(new Text("Cancellation policy"))
                    .content(new Text("Free until 48 h before arrival."))
                    .build(),
                HorizontalLayout.builder()
                    .spacing(true)
                    .content(
                        List.of(
                            Tooltip.builder().text("Per person and night").wrapped(new Badge("City tax € 2.00")).build(),
                            Popover.builder()
                                .wrapped(Button.builder().label("Opening hours").build())
                                .content(new Text("Reception 24 h · Restaurant 13:00–23:00"))
                                .build()))
                    .build()))
        .build();
  }
}
