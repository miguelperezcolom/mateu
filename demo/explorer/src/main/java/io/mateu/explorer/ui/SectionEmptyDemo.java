package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.data.Breadcrumbs;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.FormSection;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Explorer demo for the Oracle Spectra {@code oj-sp-section} (Mateu FormSection) and {@code
 * oj-sp-empty-state} (Mateu EmptyState) renderers: a titled section with body text over an empty
 * state whose CTA fires an action (toast).
 */
@UI("/section-empty")
@Title("Section & empty state")
public class SectionEmptyDemo implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .fullWidth(true)
        .spacing(true)
        .content(
            List.of(
                new Breadcrumbs(
                    "Booking 204",
                    List.of(new Breadcrumb("Home", "/"), new Breadcrumb("Bookings", "/dashboard")),
                    null,
                    null),
                new FormSection(
                    "Booking details",
                    null,
                    List.of(
                        Text.builder().text("Confirmation ABC-123").build(),
                        Text.builder().text("2 guests · 3 nights · Deluxe room").build()),
                    null,
                    null),
                new EmptyState(
                    null,
                    "🗂",
                    "No payments yet",
                    "Add a payment to see it listed here.",
                    "addPayment",
                    "Add payment",
                    null,
                    null)))
        .build();
  }

  @Action
  Object addPayment() {
    return Message.success("Payment added");
  }
}
