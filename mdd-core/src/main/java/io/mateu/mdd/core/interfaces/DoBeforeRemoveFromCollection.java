package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.interfaces.IBinder;

public interface DoBeforeRemoveFromCollection {

    void onRemove(IBinder binder) throws Throwable;

}
