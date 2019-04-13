package io.mateu.mdd.vaadinport.vaadin.components.app;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ExtraFilters;

import java.lang.reflect.Method;

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
    public void openCRUD(MDDOpenCRUDAction action, Class entityClass, String queryFilters, ExtraFilters extraFilters, boolean modifierPressed) {
        MDD.openCRUD(action, entityClass, queryFilters, extraFilters, modifierPressed);
    }

    @Override
    public void openComponent(AbstractAction action, Class componentClass, boolean modifierPressed) {

    }

    @Override
    public void open(AbstractAction action, Component component, boolean modifierPressed) {

    }

    @Override
    public void callMethod(String state, Class entityClass, String methodName) {

    }

    @Override
    public void callMethod(String state, Method method, Object instance, Component lastViewComponent) {

    }

    @Override
    public String getCurrentState() {
        return null;
    }

    @Override
    public void openWizardPage(Class firstPageClass) {
        MDD.openWizard(firstPageClass);
    }
}
