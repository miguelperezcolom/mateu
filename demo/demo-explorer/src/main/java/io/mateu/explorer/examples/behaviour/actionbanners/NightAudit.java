package io.mateu.explorer.examples.behaviour.actionbanners;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PageBanners;
import java.util.List;

/**
 * An action can return banners for the current page: a bare {@link PageBanner} (or a list)
 * REPLACES the banners earlier actions showed; {@link PageBanners#append} adds to them. They are
 * cleared when the user navigates away.
 */
@Title("Night audit")
public class NightAudit {

  @ReadOnly int checks;

  @Button
  @Label("Run audit (replace)")
  PageBanner audit() {
    return new PageBanner(BannerTheme.SUCCESS, "Audit passed", "All 214 folios balance.");
  }

  @Button
  @Label("Add a finding (append)")
  List<Object> finding() {
    checks++;
    // the new state (checks) AND the appended banner, in one answer
    return List.of(
        this,
        PageBanners.append(
            new PageBanner(BannerTheme.WARNING, "Finding " + checks, "Folio " + (1000 + checks) + " is open.")));
  }
}
