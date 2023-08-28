package io.mateu.mdd.core.interfaces;

public interface PersistentPojo<Id> extends ReadOnlyPojo<Id> {

    default boolean isNewRecord() {
        return false;
    }

    void save() throws Throwable;
}
