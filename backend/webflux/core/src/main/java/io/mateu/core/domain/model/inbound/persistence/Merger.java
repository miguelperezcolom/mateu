package io.mateu.core.domain.model.inbound.persistence;

import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.model.util.persistence.EntityDeserializer;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Scope("prototype")
public class Merger {

  @PersistenceContext EntityManager em;
  @Autowired Serializer serializer;

  @Autowired EntityDeserializer entityDeserializer;

  @Transactional
  public void merge(Object entity) {
    em.merge(entity);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void mergeAndCommit(Object entity) {
    em.merge(entity);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void mergeAndCommit(Map<String, Object> data, Class entityClass) throws Exception {
    em.merge(getEntity(data, entityClass));
  }

  public Object getEntity(Map<String, Object> data, Class entityClass) throws Exception {
    return entityDeserializer.fromJson(em, serializer.toJson(data), entityClass);
  }

  public Object loadEntity(Map<String, Object> data, Class entityClass) {
    return em.find(entityClass, data.get("__id"));
  }
}
