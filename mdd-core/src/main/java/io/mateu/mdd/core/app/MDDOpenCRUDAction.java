package io.mateu.mdd.core.app;


public class MDDOpenCRUDAction extends AbstractAction {

    private final Class entityClass;
    private final String queryFilters;

    public MDDOpenCRUDAction(String name, Class entityClass) {
        this(name, entityClass, null);
    }

    public MDDOpenCRUDAction(String name, Class entityClass, String queryFilters) {
        super(name);
        this.entityClass = entityClass;
        this.queryFilters = queryFilters;
    }

    public String getQueryFilters() {
        return queryFilters;
    }

    @Override
    public void run(MDDExecutionContext context) {
        context.openCRUD(this, entityClass, getQueryFilters(), isModifierPressed());
    }
}
