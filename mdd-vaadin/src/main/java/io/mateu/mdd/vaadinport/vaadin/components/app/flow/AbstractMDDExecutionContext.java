package io.mateu.mdd.vaadinport.vaadin.components.app.flow;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.MDDAction;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;

public class AbstractMDDExecutionContext implements MDDExecutionContext {

    @Override
    public void alert(String s) {
        MDD.alert(s);
    }

    @Override
    public void openEditor(MDDOpenEditorAction action, Class viewClass, Object id, boolean modifierPressed) {
        MDD.openEditor(action, viewClass, id, modifierPressed);
    }

    @Override
    public void openListView(MDDOpenListViewAction mddOpenListViewAction, Class listViewClass, boolean modifierPressed) {
        MDD.openView(mddOpenListViewAction, listViewClass, modifierPressed);
    }

    @Override
    public void openCRUD(MDDAction action, Class entityClass, String queryFilters, boolean modifierPressed) {
        MDD.openCRUD(action, entityClass, queryFilters, modifierPressed);
    }
}
