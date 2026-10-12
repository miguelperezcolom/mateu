package io.mateu.sample1.pages;

import io.mateu.uidl.annotations.Banner;
import io.mateu.uidl.annotations.BadgeInHeader;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Overline;
import io.mateu.uidl.annotations.PageWidth;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Timestamp;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PageBanners;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.data.RecordSwitcher;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PeerNavigationSupplier;
import io.mateu.uidl.interfaces.RecordSwitcherSupplier;
import java.util.List;

/**
 * Every element of the canonical page header on one page (e2e/tests/shared/page-anatomy.spec.ts):
 * overline, title, subtitle, header badge, KPI, timestamp, peer navigation, record switcher,
 * toolbar and bottom buttons, a static banner, banners returned by actions (replace and append),
 * a FAB, and a fixed page width.
 */
@UI("/arch/page")
@Title("Requisition 4471")
@Subtitle("Pending approval")
@Overline("Requisitions")
@PageWidth(PageWidthStyle.FIXED)
public class PageAnatomy implements PeerNavigationSupplier, RecordSwitcherSupplier {

  @BadgeInHeader(color = "success")
  public String status = "Approved";

  @KPI public String amount = "1,240 €";

  @Timestamp("Last updated")
  public String updatedAt = "2026-07-20 12:00";

  public String notes = "Two chairs";

  public String record = "4471";

  @Banner(theme = BannerTheme.INFO, title = "Heads up")
  public String info() {
    return "Static banner text";
  }

  @Toolbar
  public PageBanner warn() {
    return new PageBanner(BannerTheme.WARNING, "Careful", "Returned by an action");
  }

  @Button
  public PageBanners appendBanner() {
    return PageBanners.append(new PageBanner(BannerTheme.SUCCESS, "Appended", "Another one"));
  }

  @Fab(icon = "vaadin:plus", label = "Add")
  public Message add() {
    return Message.success("Fab pressed");
  }

  @Override
  public PeerNav peers(HttpRequest httpRequest) {
    return new PeerNav("Previous", null, "Welcome", "/arch/welcome");
  }

  @Override
  public RecordSwitcher switcher(HttpRequest httpRequest) {
    return RecordSwitcher.of(
        List.of(new Option("4471", "Requisition 4471"), new Option("4472", "Requisition 4472")),
        record);
  }

  @Override
  public Object switchTo(String value, HttpRequest httpRequest) {
    return Message.success("Switched to " + value);
  }
}
