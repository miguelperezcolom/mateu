package io.mateu.mdd.core.interfaces;

import io.mateu.util.Helper;

import java.io.IOException;

public interface PersistentPojo extends ReadOnlyPojo {

    void save() throws Throwable;
}
