package io.mateu.mdd.core.app;

import io.mateu.mdd.core.interfaces.Crud;

import java.lang.reflect.InvocationTargetException;

public interface MDDOpenCRUDActionViewBuilder {

    Crud buildView(MDDOpenCRUDAction action) throws InvocationTargetException, NoSuchMethodException, IllegalAccessException, InstantiationException, Exception;

}
