package io.mateu.explorer.examples.behaviour.breadcrumbs;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.interfaces.BreadcrumbsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.TitleSupplier;
import java.util.List;

/**
 * Breadcrumbs: the trail above the title. With no declaration, the trail follows the menu. A fixed
 * trail is {@code @Breadcrumbs({@Breadcrumb(label, url)…})}; one that depends on the record is a
 * {@link BreadcrumbsSupplier} — an empty link is the current page (not clickable).
 */
@ReadOnly
public class InvoicePage implements BreadcrumbsSupplier, TitleSupplier {

  /** from the route: {@code x/behaviour/breadcrumbs/invoices/:id} */
  String id;

  String guest = "Ada Lovelace";

  String total = "€ 1,240";

  @Override
  public List<Breadcrumb> breadcrumbs(HttpRequest httpRequest) {
    return List.of(
        new Breadcrumb("Behaviour", "/behaviour/overview"),
        new Breadcrumb("Breadcrumbs", "/behaviour/navigation/breadcrumbs"),
        new Breadcrumb("Invoice " + id + " · " + guest, ""));
  }

  @Override
  public String title() {
    return "Invoice " + id;
  }
}
