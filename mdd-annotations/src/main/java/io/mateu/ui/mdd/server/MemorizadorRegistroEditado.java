package io.mateu.ui.mdd.server;

import io.mateu.ui.core.shared.UserData;

public interface MemorizadorRegistroEditado {


    void recordar(UserData user, boolean isNew, String name, String sourceurl, Object id);
}
