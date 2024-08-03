package io.mateu.jpa.domain.ui.cruds;

import io.mateu.core.domain.model.outbound.modelToDtoMappers.EntityProvider;
import jakarta.persistence.EntityManager;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
public class JpaEntityProvider implements EntityProvider {

  private final EntityManager em;

  public JpaEntityProvider(EntityManager em) {
    this.em = em;
  }

  @Override
  public Object find(Class type, Object id) {
    return em.find(type, id);
  }
}
