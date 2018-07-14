package io.mateu.mdd.core.app;

public interface MDDExecutionContext {

    void alert(String s);

    void openEditor(MDDOpenEditorAction mddOpenEditorAction, Class viewClass, Object id, boolean modifierPressed);

    void openListView(MDDOpenListViewAction mddOpenListViewAction, Class viewClass, boolean modifierPressed);

    void openCRUD(MDDAction mddAction, Class entityClass, String queryFilters, boolean modifierPressed);
}
