package io.mateu.core.domain.model.editors;

import io.mateu.reflection.ReflectionHelper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EntityEditorFactory {

  @PersistenceContext EntityManager em;

  @Transactional
  public EntityEditor create(Object entity, int __index, int __count) throws Exception {
    entity = em.find(entity.getClass(), ReflectionHelper.getId(entity));
    return new EntityEditor(entity, __index, __count);
  }
}
