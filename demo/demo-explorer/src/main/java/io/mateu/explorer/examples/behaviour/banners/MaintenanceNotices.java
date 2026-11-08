package io.mateu.explorer.examples.behaviour.banners;

import io.mateu.uidl.annotations.Banner;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.BannerTheme;

/**
 * Page banners sit under the header, above the content. A {@code @Banner} method's return value is
 * the description (so it can be dynamic); {@code theme} colours it, {@code closeable} adds a
 * dismiss button and {@code timeoutSeconds} dismisses it by itself. A {@code BannerSupplier}
 * returns them programmatically instead (and wins over the annotations).
 */
@Title("Front desk")
public class MaintenanceNotices {

  String room = "214";

  @Banner(theme = BannerTheme.INFO, title = "Lift maintenance")
  public String lift() {
    return "The east lift is out of service until 14:00.";
  }

  @Banner(theme = BannerTheme.WARNING, title = "Overbooking risk", closeable = true)
  public String overbooking() {
    return "Saturday is at 103% — confirm the walk-in policy.";
  }

  @Banner(theme = BannerTheme.SUCCESS, title = "Night audit done", timeoutSeconds = 5)
  public String audit() {
    return "This banner closes itself after 5 seconds.";
  }
}
