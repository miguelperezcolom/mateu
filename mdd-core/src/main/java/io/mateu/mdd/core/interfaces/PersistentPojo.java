package io.mateu.mdd.core.interfaces;

import io.mateu.util.Helper;

import java.io.IOException;

public interface PersistentPojo extends ReadOnlyPojo {

    default boolean isNew() {
        return false;
    }

    void save() throws Throwable;
}
