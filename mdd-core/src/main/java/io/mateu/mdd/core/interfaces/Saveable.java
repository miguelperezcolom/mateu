package io.mateu.mdd.core.interfaces;

import io.mateu.util.Helper;

import java.io.IOException;

public interface Saveable {

    default String getEntityName() {
        return Helper.capitalize(getClass().getSimpleName());
    }

    void save() throws IOException, Throwable;

    Object getId();
}
