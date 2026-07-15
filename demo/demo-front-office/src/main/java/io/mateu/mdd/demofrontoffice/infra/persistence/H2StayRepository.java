package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.domain.stay.StayRepository;
import io.mateu.mdd.demofrontoffice.domain.stay.StayStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jdbc.core.JdbcAggregateTemplate;
import org.springframework.stereotype.Repository;

/** H2 adapter of the {@link StayRepository} port. */
@Repository
class H2StayRepository implements StayRepository {

  private final StayCrud crud;
  private final JdbcAggregateTemplate template;

  H2StayRepository(StayCrud crud, JdbcAggregateTemplate template) {
    this.crud = crud;
    this.template = template;
  }

  @Override
  public Optional<Stay> findById(String id) {
    return crud.findById(id);
  }

  @Override
  public List<Stay> findAll() {
    return crud.findAll();
  }

  @Override
  public List<Stay> findArrivals() {
    return crud.findByStatusOrderByCheckInAsc(StayStatus.ARRIVING);
  }

  @Override
  public List<Stay> findInHouse() {
    return crud.findByStatusOrderByCheckOutAsc(StayStatus.IN_HOUSE);
  }

  @Override
  public Stay save(Stay stay) {
    return crud.existsById(stay.id()) ? crud.save(stay) : template.insert(stay);
  }
}
