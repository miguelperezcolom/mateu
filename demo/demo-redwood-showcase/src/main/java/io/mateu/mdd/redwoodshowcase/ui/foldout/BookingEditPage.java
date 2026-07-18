package io.mateu.mdd.redwoodshowcase.ui.foldout;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import jakarta.validation.constraints.NotEmpty;
import java.net.URI;

/**
 * Edit page navigated to from the horizontal Foldout overview's Edit affordance (RDS: the horizontal
 * config navigates to an edit page instead of opening a dialog). Save/cancel navigate back.
 */
@UI("/booking-edit")
@Title("Edit booking")
public class BookingEditPage {

  @NotEmpty String guestName = "Jane Smith";

  String status = "Confirmed";

  @Toolbar
  public URI save() {
    return URI.create("/foldout-horizontal-demo");
  }

  @Toolbar
  public URI cancel() {
    return URI.create("/foldout-horizontal-demo");
  }
}
