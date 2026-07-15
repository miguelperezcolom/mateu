package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.catalog.ChargeCatalogItem;
import java.util.List;
import org.springframework.data.repository.ListCrudRepository;

/** Spring Data JDBC repository backing {@link H2ChargeCatalogRepository}. */
interface ChargeCatalogCrud extends ListCrudRepository<ChargeCatalogItem, String> {

  List<ChargeCatalogItem> findByNameContainingIgnoreCase(String text);
}
