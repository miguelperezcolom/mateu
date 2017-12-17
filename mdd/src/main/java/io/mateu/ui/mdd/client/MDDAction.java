package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.AbstractAction;

public class MDDAction extends AbstractAction {

    private final Class entityClass;
    private final Object id;

    public MDDAction(String name, Class entityClass, Object id) {
        super(name);
        this.entityClass = entityClass;
        this.id = id;
    }

    public MDDAction(String name, Class entityClass) {
        this(name, entityClass, null);
    }

    @Override
    public void run() {
        if (id == null) {
            MDD.openCRUD(entityClass);
        } else {
            MDD.openEditor(entityClass, id);
        }
    }
}
