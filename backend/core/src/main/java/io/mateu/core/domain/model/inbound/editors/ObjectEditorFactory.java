package io.mateu.core.domain.model.inbound.editors;

import io.mateu.core.domain.model.util.Serializer;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ObjectEditorFactory {

  @PersistenceContext EntityManager em;

  @Autowired Serializer serializer;

  @Transactional
  public ObjectEditor create(Object pojo, int __index, int __count, String listId)
      throws Exception {
    return new ObjectEditor(pojo, __index, __count, serializer, listId);
  }
}
