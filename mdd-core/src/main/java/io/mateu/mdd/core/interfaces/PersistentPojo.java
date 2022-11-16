package io.mateu.mdd.core.interfaces;

import io.mateu.util.Helper;

import java.io.IOException;

public interface PersistentPojo {

    default String getEntityName() {
        return Helper.capitalize(getClass().getSimpleName());
    }

    void save() throws IOException, Throwable;

    void load(Object id) throws Throwable;

    Object getId();
}
