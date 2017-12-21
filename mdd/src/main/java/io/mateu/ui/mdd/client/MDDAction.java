package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.app.AbstractAction;

public class MDDAction extends AbstractAction {

    private final Class entityClass;
    private final String queryFilters;

    public MDDAction(String name, Class entityClass) {
        this(name, entityClass, null);
    }

    public MDDAction(String name, Class entityClass, String queryFilters) {
        super(name);
        this.entityClass = entityClass;
        this.queryFilters = queryFilters;
    }

    @Override
    public void run() {
        MDD.openCRUD(entityClass, queryFilters);
    }
}
