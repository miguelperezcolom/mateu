package io.mateu.core.domain.model.editors;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ObjectEditorFactory {

  @PersistenceContext EntityManager em;

  @Transactional
  public ObjectEditor create(Object pojo, int __index, int __count) throws Exception {
    return new ObjectEditor(pojo, __index, __count);
  }
}
