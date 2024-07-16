package io.mateu.core.domain.model.editors;

import io.mateu.core.domain.reflection.ReflectionHelper;
import io.mateu.core.domain.util.Serializer;
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
  public EntityEditor create(Object entity, int __index, int __count) throws Exception {
    entity = em.find(entity.getClass(), reflectionHelper.getId(entity));
    return new EntityEditor(entity, __index, __count, reflectionHelper, serializer);
  }
}
