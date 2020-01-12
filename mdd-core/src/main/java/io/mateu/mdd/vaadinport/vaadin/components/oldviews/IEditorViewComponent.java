package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.reflection.FieldInterfaced;

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

}
