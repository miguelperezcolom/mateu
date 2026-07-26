package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.catalog.AddOnCatalogItem;
import io.mateu.mdd.demofrontoffice.domain.catalog.AddOnCatalogRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jdbc.core.JdbcAggregateTemplate;
import org.springframework.stereotype.Repository;

/** H2 adapter of the {@link AddOnCatalogRepository} port. */
@Repository
class H2AddOnCatalogRepository implements AddOnCatalogRepository {

  private final AddOnCatalogCrud crud;
  private final JdbcAggregateTemplate template;

  H2AddOnCatalogRepository(AddOnCatalogCrud crud, JdbcAggregateTemplate template) {
    this.crud = crud;
    this.template = template;
  }

  @Override
  public Optional<AddOnCatalogItem> findById(String id) {
    return crud.findById(id);
  }

  @Override
  public List<AddOnCatalogItem> findAll() {
    return crud.findAll();
  }

  @Override
  public AddOnCatalogItem save(AddOnCatalogItem item) {
    return crud.existsById(item.id()) ? crud.save(item) : template.insert(item);
  }
}
