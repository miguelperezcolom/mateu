package io.mateu.mdd.demovb.infra.in.ui.headerextras;

import io.mateu.uidl.annotations.Overline;
import io.mateu.uidl.annotations.TitlePlaceholder;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PeerNavigationSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;

/**
 * A record still being created: its title is the name typed so far, so while it is empty the
 * header shows the {@code @TitlePlaceholder} instead (dimmed — it never reads as a real title). The
 * arrow back returns to {@link CustomerRecordPage}; there is no next record.
 */
@UI("/header-extras/new")
@Overline("Customers")
@TitlePlaceholder("New customer…")
public class NewCustomerPage implements TitleSupplier, PeerNavigationSupplier {

  String name = "";

  String email;

  @Override
  public String title() {
    return name == null ? "" : name;
  }

  @Override
  public PeerNav peers(HttpRequest httpRequest) {
    return new PeerNav("Ada Lovelace", "/header-extras", null, null);
  }
}
