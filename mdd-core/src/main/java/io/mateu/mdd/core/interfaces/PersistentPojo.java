package io.mateu.mdd.core.interfaces;

import io.mateu.util.Helper;

import java.io.IOException;

public interface PersistentPojo<Id> extends ReadOnlyPojo<Id> {

    default boolean isNew() {
        return false;
    }

    void save() throws Throwable;
}
