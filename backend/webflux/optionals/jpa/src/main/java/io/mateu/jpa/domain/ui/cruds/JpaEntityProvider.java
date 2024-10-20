package io.mateu.jpa.domain.ui.cruds;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.EntityProvider;
import jakarta.persistence.EntityManager;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
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
