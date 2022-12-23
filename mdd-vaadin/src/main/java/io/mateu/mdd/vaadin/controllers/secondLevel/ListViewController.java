package io.mateu.mdd.vaadin.controllers.secondLevel;

import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.components.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class ListViewController extends ListViewComponentController {

    public ListViewController(ListViewComponent listViewComponent) {
        super(listViewComponent);
    }

    public ListViewController(MDDOpenListViewAction action) {
        super((ListViewComponent) MDDViewComponentCreator.createComponent(action.listViewClass));
    }

}
