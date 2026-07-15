package io.mateu.mdd.demofrontoffice.ui.checkout;

import io.mateu.mdd.demofrontoffice.domain.catalog.ChargeCatalogItem;
import io.mateu.mdd.demofrontoffice.domain.catalog.ChargeCatalogRepository;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import org.springframework.stereotype.Service;

/** The charge catalog behind the check-out "Postear cargo" lookup. */
@Service
public class CatalogOptionsSupplier implements LookupOptionsSupplier {

  private final ChargeCatalogRepository chargeCatalog;

  public CatalogOptionsSupplier(ChargeCatalogRepository chargeCatalog) {
    this.chargeCatalog = chargeCatalog;
  }

  @Override
  public ListingData<Option> search(
      String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
    var s = searchText == null ? "" : searchText.toLowerCase();
    return ListingData.of(
        chargeCatalog.findAll().stream()
            .filter(
                item ->
                    s.isBlank()
                        || item.name().toLowerCase().contains(s)
                        || item.code().toLowerCase().contains(s))
            .map(item -> new Option(item.code(), label(item)))
            .toList());
  }

  static String label(ChargeCatalogItem item) {
    return item.code() + " · " + item.name() + " — " + GuestHeaders.euros(item.price());
  }
}
