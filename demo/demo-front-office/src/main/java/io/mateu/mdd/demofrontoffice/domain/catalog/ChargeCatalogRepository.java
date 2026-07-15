package io.mateu.mdd.demofrontoffice.domain.catalog;

import java.util.List;
import java.util.Optional;

/** Repository port of the charge catalog (reference data). */
public interface ChargeCatalogRepository {

  Optional<ChargeCatalogItem> findByCode(String code);

  List<ChargeCatalogItem> findAll();

  List<ChargeCatalogItem> search(String text);

  ChargeCatalogItem save(ChargeCatalogItem item);
}
