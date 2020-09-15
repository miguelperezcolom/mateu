package io.mateu.mdd.core.app;


import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.views.ExtraFilters;
import lombok.Getter;

import java.util.Map;

@Getter
public class MDDOpenCRUDAction extends AbstractAction {

    private final Class entityClass;
    private String queryFilters;
    private ExtraFilters extraFilters;
    private Map<String, Object> defaultValues;
    private String columns;
    private String fields;
    private String filters;

    public MDDOpenCRUDAction(String name, Class entityClass) {
        super(name);
        this.entityClass = entityClass;
    }

    public MDDOpenCRUDAction(Class entityClass) {
        super(null);
        this.entityClass = entityClass;
    }

    public void run() throws Exception {
        MDDUI.get().getNavegador().getViewProvider().openCRUD(this);
    }


    public MDDOpenCRUDAction setQueryFilters(String queryFilters) {
        this.queryFilters = queryFilters;
        return this;
    }

    public MDDOpenCRUDAction setExtraFilters(ExtraFilters extraFilters) {
        this.extraFilters = extraFilters;
        return this;
    }

    public MDDOpenCRUDAction setDefaultValues(Map<String, Object> defaultValues) {
        this.defaultValues = defaultValues;
        return this;
    }

    public MDDOpenCRUDAction setColumns(String columns) {
        this.columns = columns;
        return this;
    }

    public MDDOpenCRUDAction setFields(String fields) {
        this.fields = fields;
        return this;
    }

    public MDDOpenCRUDAction setFilters(String filters) {
        this.filters = filters;
        return this;
    }
}
