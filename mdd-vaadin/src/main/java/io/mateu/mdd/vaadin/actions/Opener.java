package io.mateu.mdd.vaadin.actions;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenCustomComponentAction;

import java.lang.reflect.Method;

public class Opener {
    public static void callMethod(Method method) {
    }

    public static void openCRUD(MDDOpenCRUDAction action) {
    }

    public static void open(MDDOpenCustomComponentAction action, Component component) {
    }

    public static void openEditor(Object bean) {
    }

    public static void openListView(Class listViewClass) {
    }

    public static void openWizard(Object firstPage) {
    }
}
