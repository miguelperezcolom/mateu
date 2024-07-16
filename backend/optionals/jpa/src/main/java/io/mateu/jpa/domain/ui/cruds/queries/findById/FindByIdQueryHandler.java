package io.mateu.jpa.domain.ui.cruds.queries.findById;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FindByIdQueryHandler {

  @PersistenceContext private EntityManager em;

  @Transactional
  public Object run(FindByIdQuery query) {
    return em.find(query.getEntityClass(), query.getId());
  }
}
