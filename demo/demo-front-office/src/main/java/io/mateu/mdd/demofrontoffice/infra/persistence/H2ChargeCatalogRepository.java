package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.catalog.ChargeCatalogItem;
import io.mateu.mdd.demofrontoffice.domain.catalog.ChargeCatalogRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jdbc.core.JdbcAggregateTemplate;
import org.springframework.stereotype.Repository;

/** H2 adapter of the {@link ChargeCatalogRepository} port. */
@Repository
class H2ChargeCatalogRepository implements ChargeCatalogRepository {

  private final ChargeCatalogCrud crud;
  private final JdbcAggregateTemplate template;

  H2ChargeCatalogRepository(ChargeCatalogCrud crud, JdbcAggregateTemplate template) {
    this.crud = crud;
    this.template = template;
  }

  @Override
  public Optional<ChargeCatalogItem> findByCode(String code) {
    return crud.findById(code);
  }

  @Override
  public List<ChargeCatalogItem> findAll() {
    return crud.findAll();
  }

  @Override
  public List<ChargeCatalogItem> search(String text) {
    return text == null || text.isBlank()
        ? crud.findAll()
        : crud.findByNameContainingIgnoreCase(text.trim());
  }

  @Override
  public ChargeCatalogItem save(ChargeCatalogItem item) {
    return crud.existsById(item.code()) ? crud.save(item) : template.insert(item);
  }
}
