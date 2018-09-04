package io.mateu.mdd.core.interfaces;

import java.io.IOException;

public interface PersistentPOJO {

    void save() throws IOException, Throwable;

    void load(Object id) throws Throwable;

    Object getId();
}
