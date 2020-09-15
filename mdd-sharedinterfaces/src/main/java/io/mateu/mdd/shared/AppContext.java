package io.mateu.mdd.shared;

import java.io.IOException;

public interface AppContext {

    void initialized();

    boolean needsPopulation();

    void populate() throws Throwable;

    void destroyed();

}
