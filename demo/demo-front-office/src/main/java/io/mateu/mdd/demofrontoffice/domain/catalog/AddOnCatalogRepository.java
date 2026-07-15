package io.mateu.mdd.demofrontoffice.domain.catalog;

import java.util.List;
import java.util.Optional;

/** Repository port of the add-on catalog (reference data). */
public interface AddOnCatalogRepository {

  Optional<AddOnCatalogItem> findById(String id);

  List<AddOnCatalogItem> findAll();

  AddOnCatalogItem save(AddOnCatalogItem item);
}
