package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.catalog.AddOnCatalogItem;
import org.springframework.data.repository.ListCrudRepository;

/** Spring Data JDBC repository backing {@link H2AddOnCatalogRepository}. */
interface AddOnCatalogCrud extends ListCrudRepository<AddOnCatalogItem, String> {}
