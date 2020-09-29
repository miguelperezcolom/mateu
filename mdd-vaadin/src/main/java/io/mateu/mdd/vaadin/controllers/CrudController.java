package io.mateu.mdd.vaadin.controllers;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;

public class CrudController extends Controller {
    private final Class entityClass;

    public CrudController(MDDOpenCRUDAction action) {
        super();
        this.entityClass = action.getEntityClass();
    }

    @Override
    public Component apply(String path, String step, String remaining) throws Exception {

        if ("".equals(step)) {
            return null;
        } else {
            if ("".equals(step)) {

            } else {

            }
        }

        return super.apply(path, step, remaining);
    }
}
