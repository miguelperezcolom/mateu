package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.core.data.MDDBinder;

public interface DoBeforeRemoveFromCollection {

    void onRemove(MDDBinder binder) throws Throwable;

}
