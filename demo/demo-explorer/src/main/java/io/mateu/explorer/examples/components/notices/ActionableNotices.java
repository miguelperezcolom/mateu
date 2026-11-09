package io.mateu.explorer.examples.components.notices;

import io.mateu.uidl.data.CalloutCard;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The same components with their CTAs WIRED: each names an {@code actionId}, and this view has a
 * public method of that name, so pressing it runs the method on the server (here, a toast).
 */
public class ActionableNotices implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                Notice.builder()
                    .theme("warning")
                    .text("2 complaints pending")
                    .actionLabel("Review")
                    .actionId("reviewComplaints")
                    .build(),
                CalloutCard.builder()
                    .title("Upgrade to a junior suite")
                    .description("Free for these nights — € 60 more per night.")
                    .icon("⭐")
                    .ctaLabel("Offer the upgrade")
                    .actionId("offerUpgrade")
                    .theme("info")
                    .build(),
                EmptyState.builder()
                    .icon("🛎️")
                    .title("No arrivals yet")
                    .description("Bookings for today will show up here.")
                    .actionLabel("New walk-in booking")
                    .actionId("newWalkIn")
                    .build()))
        .build();
  }

  public Message reviewComplaints() {
    return new Message("Opening the 2 complaints: room 305 (noise), room 118 (tap)");
  }

  public Message offerUpgrade() {
    return Message.success("Upgrade offered to Lucía Fernández");
  }

  public Message newWalkIn() {
    return new Message("Starting a walk-in booking…");
  }
}
