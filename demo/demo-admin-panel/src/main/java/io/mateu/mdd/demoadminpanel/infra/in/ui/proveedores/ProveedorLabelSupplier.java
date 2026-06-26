package io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import org.springframework.stereotype.Service;

@Service
public class ProveedorLabelSupplier implements LookupLabelSupplier {

  @Override
  public String label(String fieldName, Object id, HttpRequest httpRequest) {
    return ProveedorOptionsSupplier.PROVEEDORES.stream()
        .filter(o -> o.value().equals(id))
        .map(io.mateu.uidl.data.Option::label)
        .findFirst()
        .orElse(String.valueOf(id));
  }
}
