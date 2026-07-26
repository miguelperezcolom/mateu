package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.automation.Automation;
import io.mateu.mdd.demofrontoffice.domain.automation.AutomationRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jdbc.core.JdbcAggregateTemplate;
import org.springframework.stereotype.Repository;

/** H2 adapter of the {@link AutomationRepository} port. */
@Repository
class H2AutomationRepository implements AutomationRepository {

  private final AutomationCrud crud;
  private final JdbcAggregateTemplate template;

  H2AutomationRepository(AutomationCrud crud, JdbcAggregateTemplate template) {
    this.crud = crud;
    this.template = template;
  }

  @Override
  public Optional<Automation> findById(String id) {
    return crud.findById(id);
  }

  @Override
  public List<Automation> findAll() {
    return crud.findAll();
  }

  @Override
  public Automation save(Automation automation) {
    return crud.existsById(automation.id()) ? crud.save(automation) : template.insert(automation);
  }
}
