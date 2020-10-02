package io.mateu.mdd.vaadin.controllers.secondLevel;

import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.navigation.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class CrudController extends ListViewComponentController {


    public CrudController(ViewStack stack, String path, MDDOpenCRUDAction action) throws Exception {
        super(stack, path, (ListViewComponent) MDDViewComponentCreator.createComponent(action));
    }

}
