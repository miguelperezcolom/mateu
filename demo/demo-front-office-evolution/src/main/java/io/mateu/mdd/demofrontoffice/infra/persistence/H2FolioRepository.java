package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.folio.Folio;
import io.mateu.mdd.demofrontoffice.domain.folio.FolioRepository;
import java.util.Optional;
import org.springframework.data.jdbc.core.JdbcAggregateTemplate;
import org.springframework.stereotype.Repository;

/** H2 adapter of the {@link FolioRepository} port. */
@Repository
class H2FolioRepository implements FolioRepository {

  private final FolioCrud crud;
  private final JdbcAggregateTemplate template;

  H2FolioRepository(FolioCrud crud, JdbcAggregateTemplate template) {
    this.crud = crud;
    this.template = template;
  }

  @Override
  public Optional<Folio> findById(String id) {
    return crud.findById(id);
  }

  @Override
  public Optional<Folio> findByStayId(String stayId) {
    return crud.findByStayId(stayId);
  }

  @Override
  public Folio save(Folio folio) {
    return crud.existsById(folio.id()) ? crud.save(folio) : template.insert(folio);
  }
}
