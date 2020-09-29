package io.mateu.mdd.vaadin.controllers;

import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.core.interfaces.ListView;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.reflection.ReflectionHelper;

public class ListViewController extends Controller {

    private final ListView listView;

    public ListViewController(MDDOpenListViewAction action) throws Exception {
        super();
        this.listView = (ListView) ReflectionHelper.newInstance(action.listViewClass);
    }

    @Override
    public AbstractViewComponent apply(String path) {
        return null;
    }

}
