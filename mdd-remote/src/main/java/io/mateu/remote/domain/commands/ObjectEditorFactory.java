package io.mateu.remote.domain.commands;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.ObjectEditor;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ObjectEditorFactory {

    @PersistenceContext
    EntityManager em;

    @Transactional
    public ObjectEditor create(Object pojo, int __index, int __count) throws Exception {
        return new ObjectEditor(pojo, __index, __count);
    }
}
