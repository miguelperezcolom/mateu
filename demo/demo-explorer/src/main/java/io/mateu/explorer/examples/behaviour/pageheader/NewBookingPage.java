package io.mateu.explorer.examples.behaviour.pageheader;

import io.mateu.uidl.annotations.BadgeInHeader;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Overline;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Timestamp;
import io.mateu.uidl.annotations.TitlePlaceholder;
import io.mateu.uidl.interfaces.TitleSupplier;

/**
 * The canonical page header, declared on the class and its fields:
 *
 * <ul>
 *   <li>{@code @Overline} — the quiet line above the title;
 *   <li>{@code @TitlePlaceholder} — shown, dimmed, while the title is still empty (here the title
 *       is the guest's name, from a {@link TitleSupplier});
 *   <li>{@code @Subtitle}; {@code @BadgeInHeader} fields — status chips; {@code @KPI} fields —
 *       label / value pairs; {@code @Timestamp} — "last updated".
 * </ul>
 *
 * Header-only fields are kept out of the form body.
 */
@Overline("Reservations")
@TitlePlaceholder("New booking…")
@Subtitle("Fill in the guest to give the booking its name")
public class NewBookingPage implements TitleSupplier {

  String guest = "";

  String room = "214";

  @BadgeInHeader(color = "success")
  String status = "Confirmed";

  @BadgeInHeader(label = "VIP", color = "warning")
  boolean vip = true;

  @KPI String nights = "4";

  @KPI String total = "€ 1,240";

  @Timestamp("Last updated")
  String updatedAt = "2026-11-08 09:30";

  @Override
  public String title() {
    return guest == null ? "" : guest;
  }
}
