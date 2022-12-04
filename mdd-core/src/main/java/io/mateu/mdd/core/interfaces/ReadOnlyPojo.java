package io.mateu.mdd.core.interfaces;

import io.mateu.util.Helper;

public interface ReadOnlyPojo {

    default boolean hasEditor() {
        return false;
    }

    default Object getEditor() {
        return null;
    }

    default String getEntityName() {
        return Helper.capitalize(getClass().getSimpleName());
    }

    void load(Object id) throws Throwable;

    Object getId();
}
