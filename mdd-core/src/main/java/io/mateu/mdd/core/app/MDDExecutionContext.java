package io.mateu.mdd.core.app;

import com.vaadin.ui.Component;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ExtraFilters;

import java.lang.reflect.Method;

public interface MDDExecutionContext {

    void alert(String s);

    void openEditor(MDDOpenEditorAction mddOpenEditorAction, Class viewClass, Object id, boolean modifierPressed) throws Exception;

    void openListView(MDDOpenListViewAction mddOpenListViewAction, Class viewClass, boolean modifierPressed) throws Exception;

    void openCRUD(MDDOpenCRUDAction mddOpenCRUDAction, Class entityClass, String queryFilters, ExtraFilters extraFilters, boolean modifierPressed) throws Exception;

    void open(AbstractAction action, Component component, boolean modifierPressed) throws Exception;

    void callMethod(String state, Method method, Object instance, Component lastViewComponent);

    void openWizardPage(Class firstPageClass);
}
