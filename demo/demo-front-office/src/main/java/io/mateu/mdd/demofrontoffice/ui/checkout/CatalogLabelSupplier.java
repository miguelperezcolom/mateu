package io.mateu.mdd.demofrontoffice.ui.checkout;

import io.mateu.mdd.demofrontoffice.data.HotelData;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import org.springframework.stereotype.Service;

/** Resolves the display label of a picked charge-catalog item. */
@Service
public class CatalogLabelSupplier implements LookupLabelSupplier {

  @Override
  public String label(String fieldName, Object id, HttpRequest httpRequest) {
    return HotelData.CATALOG.stream()
        .filter(item -> item.code().equals(id))
        .map(CatalogOptionsSupplier::label)
        .findFirst()
        .orElse(String.valueOf(id));
  }
}
