package io.mateu.remote.domain.commands;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.editors.EntityEditor;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EntityEditorFactory {

    @PersistenceContext
    EntityManager em;

    @Transactional
    public EntityEditor create(Object entity) throws Exception {
        entity = em.find(entity.getClass(), ReflectionHelper.getId(entity));
        return new EntityEditor(entity);
    }
}
