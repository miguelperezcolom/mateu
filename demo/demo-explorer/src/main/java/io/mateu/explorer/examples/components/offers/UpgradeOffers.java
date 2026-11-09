package io.mateu.explorer.examples.components.offers;

import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.OfferCard;
import io.mateu.uidl.data.PricingPlan;
import io.mateu.uidl.data.PricingTable;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The offers with their CTAs wired: the OfferCard's "Upgrade" and each plan's "Choose" name an
 * {@code actionId} this view implements, so pressing them runs it on the server.
 */
public class UpgradeOffers implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                HorizontalLayout.builder()
                    .spacing(true)
                    .wrap(true)
                    .content(
                        List.of(
                            OfferCard.builder()
                                .title("Deluxe sea view")
                                .subtitle("Your room")
                                .features(List.of("32 m²", "King bed"))
                                .current(true)
                                .currentLabel("Current room")
                                .style("width: 17rem;")
                                .build(),
                            OfferCard.builder()
                                .tag("Most popular")
                                .title("Junior suite")
                                .subtitle("Separate lounge")
                                .features(List.of("48 m²", "King bed", "Lounge"))
                                .priceLabel("+ € 60 / night")
                                .actionLabel("Upgrade")
                                .actionId("upgrade")
                                .style("width: 17rem;")
                                .build()))
                    .build(),
                PricingTable.builder()
                    .plans(
                        List.of(
                            PricingPlan.builder().id("room").name("Room only").price("€ 142").period("/ night")
                                .features(List.of("Free Wi-Fi")).ctaLabel("Choose").actionId("choosePlan").build(),
                            PricingPlan.builder().id("bb").name("Bed & breakfast").price("€ 168").period("/ night").featured(true)
                                .features(List.of("Free Wi-Fi", "Buffet breakfast")).ctaLabel("Choose").actionId("choosePlan").build()))
                    .build()))
        .build();
  }

  public Message upgrade() {
    return Message.success("Upgraded to the junior suite: + € 180 for 3 nights");
  }

  public Message choosePlan() {
    return new Message("Plan chosen");
  }
}
