package io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProveedorOptionsSupplier implements LookupOptionsSupplier {

  static final List<Option> PROVEEDORES = List.of(
      new Option("P001", "Suministros García S.L."),
      new Option("P002", "Distribuciones del Norte"),
      new Option("P003", "Hostelería Global"),
      new Option("P004", "Bebidas Canarias"));

  @Override
  public ListingData<Option> search(
      String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
    var s = searchText == null ? "" : searchText.toLowerCase();
    return ListingData.of(
        PROVEEDORES.stream()
            .filter(o -> s.isBlank() || o.label().toLowerCase().contains(s))
            .toList());
  }
}
