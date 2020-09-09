package io.mateu.mdd.core.nose;

import io.mateu.mdd.core.data.UserData;

public interface MemorizadorRegistroEditado {


    void recordar(UserData user, boolean isNew, String name, String sourceurl, Object id);
}
