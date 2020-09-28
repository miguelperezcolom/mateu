package io.mateu.mdd.vaadinport.vaadin.components.views;

import io.mateu.mdd.shared.data.MDDBinder;
import io.mateu.reflection.FieldInterfaced;
import io.mateu.mdd.vaadinport.vaadin.util.BindedWindow;

import java.lang.reflect.Method;

public interface IEditorViewComponent {
    Method getMethod(String step);

    FieldInterfaced getField(String step);

    Object getModel();

    MDDBinder getBinder();

    void updateModel(Object m);

    void preSave() throws Throwable;

    void save(boolean goBack) throws Throwable;

    void save(boolean goBack, boolean notify) throws Throwable;

    BindedWindow getCreatorWindow();

}
