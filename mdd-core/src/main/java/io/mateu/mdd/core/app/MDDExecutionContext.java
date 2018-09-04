package io.mateu.mdd.core.app;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.interfaces.WizardPage;

import java.lang.reflect.Method;

public interface MDDExecutionContext {

    void alert(String s);

    void openEditor(MDDOpenEditorAction mddOpenEditorAction, Class viewClass, Object id, boolean modifierPressed);

    void openListView(MDDOpenListViewAction mddOpenListViewAction, Class viewClass, boolean modifierPressed);

    void openCRUD(MDDOpenCRUDAction mddOpenCRUDAction, Class entityClass, String queryFilters, boolean modifierPressed);

    void openComponent(AbstractAction action, Class componentClass, boolean modifierPressed);

    void open(AbstractAction action, Component component, boolean modifierPressed);

    void callMethod(AbstractAction action, Class entityClass, String methodName);

    void callMethod(AbstractAction action, Method method, Object instance);

    String getCurrentState();

    void openWizardPage(Class firstPageClass);
}
