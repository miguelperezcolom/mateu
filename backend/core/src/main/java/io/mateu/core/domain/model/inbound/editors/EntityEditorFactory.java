package io.mateu.core.domain.model.inbound.editors;

import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EntityEditorFactory {

  @PersistenceContext EntityManager em;
  @Autowired ReflectionHelper reflectionHelper;
  @Autowired Serializer serializer;

  @Transactional
  public EntityEditor create(Object entity, int __index, int __count, String listId) throws Exception {
    Object id = reflectionHelper.getId(entity);
    entity = em.find(entity.getClass(), id);
    return new EntityEditor(entity, __index, __count, id, serializer.toMap(entity), listId);
  }
}
