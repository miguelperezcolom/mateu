package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.AbstractAction;
import io.mateu.ui.mdd.server.interfaces.View;

public class MDDAction extends AbstractAction {

    private final Class entityClass;
    private final Class viewClass;
    private final String queryFilters;

    public MDDAction(String name, Class entityClass) {
        this(name, entityClass, null);
    }

    public MDDAction(String name, Class entityClass, String queryFilters) {
        super(name);
        this.entityClass = entityClass;
        this.viewClass = entityClass;
        this.queryFilters = queryFilters;
    }

    public String getQueryFilters() {
        return queryFilters;
    }

    @Override
    public void run() {
        MDD.openCRUD(entityClass, viewClass, getQueryFilters(), isModifierPressed());
    }
}
