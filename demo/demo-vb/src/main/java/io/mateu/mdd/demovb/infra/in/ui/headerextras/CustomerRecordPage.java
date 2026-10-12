package io.mateu.mdd.demovb.infra.in.ui.headerextras;

import io.mateu.uidl.annotations.BadgeInHeader;
import io.mateu.uidl.annotations.Overline;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Timestamp;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PeerNavigationSupplier;

/**
 * The Redwood page-header elements of a record page, declared on a Java class: the overline above
 * the title, the status badges, the "last updated" timestamp and the previous/next arrows across
 * peer records (the Redwood renderer draws them with oj-sp's header). The arrow back is disabled —
 * this is the first record; the one forward opens a record still being created
 * ({@link NewCustomerPage}, whose header shows its title placeholder).
 */
@UI("/header-extras")
@Title("Ada Lovelace")
@Overline("Customers")
@PlainText
public class CustomerRecordPage implements PeerNavigationSupplier {

  @BadgeInHeader(color = "success")
  String status = "Active";

  @BadgeInHeader(label = "VIP", color = "warning")
  boolean vip = true;

  @Timestamp("Last updated")
  String updatedAt = "2026-10-12T10:42";

  String email = "ada@example.com";

  String city = "London";

  @Override
  public PeerNav peers(HttpRequest httpRequest) {
    return new PeerNav(null, null, "New customer", "/header-extras/new");
  }
}
