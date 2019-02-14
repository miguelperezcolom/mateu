package io.mateu.mdd.core.app;

import com.vaadin.ui.Component;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ExtraFilters;

import java.lang.reflect.Method;

public interface MDDExecutionContext {

    void alert(String s);

    void openEditor(MDDOpenEditorAction mddOpenEditorAction, Class viewClass, Object id, boolean modifierPressed);

    void openListView(MDDOpenListViewAction mddOpenListViewAction, Class viewClass, boolean modifierPressed);

    void openCRUD(MDDOpenCRUDAction mddOpenCRUDAction, Class entityClass, String queryFilters, ExtraFilters extraFilters, boolean modifierPressed);

    void openComponent(AbstractAction action, Class componentClass, boolean modifierPressed);

    void open(AbstractAction action, Component component, boolean modifierPressed);

    void callMethod(String state, Class entityClass, String methodName);

    void callMethod(String state, Method method, Object instance);

    String getCurrentState();

    void openWizardPage(Class firstPageClass);
}
