package io.mateu.mdd.core.app;

import com.vaadin.ui.Component;

public interface MDDExecutionContext {

    void alert(String s);

    void openEditor(MDDOpenEditorAction mddOpenEditorAction, Class viewClass, Object id, boolean modifierPressed);

    void openListView(MDDOpenListViewAction mddOpenListViewAction, Class viewClass, boolean modifierPressed);

    void openCRUD(MDDAction mddAction, Class entityClass, String queryFilters, boolean modifierPressed);

    void openComponent(AbstractAction action, Class componentClass, boolean modifierPressed);

    void open(AbstractAction action, Component component, boolean modifierPressed);

}
