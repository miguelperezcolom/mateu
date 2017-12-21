package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.AbstractAction;

public class MDDOpenEditorAction extends AbstractAction {

    private final Class entityClass;
    private final Object id;

    public MDDOpenEditorAction(String name, Class entityClass) {
        this(name, entityClass, null);
    }

    public MDDOpenEditorAction(String name, Class entityClass, Object id) {
        super(name);
        this.entityClass = entityClass;
        this.id = id;
    }

    @Override
    public void run() {
        MDD.openEditor(entityClass, id);
    }
}
