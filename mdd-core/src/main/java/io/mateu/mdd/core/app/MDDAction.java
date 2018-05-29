package io.mateu.mdd.core.app;


import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.views.ListView;

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
        MDD.openCRUD(entityClass, getQueryFilters(), isModifierPressed());
    }
}
