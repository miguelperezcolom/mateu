package io.mateu.jpa.domain.ui.cruds.commands;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeleteRowsCommandHandler {

  @PersistenceContext private EntityManager em;

  @Transactional
  public void run(DeleteRowsCommand command) {
    for (Object o : command.getRows()) {
      if (o instanceof Map) {
        Map<String, Object> m = (Map<String, Object>) o;
        Object e = em.find(command.getEntityClass(), m.get("__id__"));
        em.remove(e);
      } else {
        o = em.merge(o);
        em.remove(o);
      }
    }
  }
}
