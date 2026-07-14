package io.mateu.mdd.demofrontoffice.ui.checkout;

import io.mateu.mdd.demofrontoffice.data.HotelData;
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

  @Override
  public ListingData<Option> search(
      String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
    var s = searchText == null ? "" : searchText.toLowerCase();
    return ListingData.of(
        HotelData.CATALOG.stream()
            .filter(
                item ->
                    s.isBlank()
                        || item.name().toLowerCase().contains(s)
                        || item.code().toLowerCase().contains(s))
            .map(item -> new Option(item.code(), label(item)))
            .toList());
  }

  static String label(HotelData.CatalogItem item) {
    return item.code() + " · " + item.name() + " — " + GuestHeaders.euros(item.price());
  }
}
