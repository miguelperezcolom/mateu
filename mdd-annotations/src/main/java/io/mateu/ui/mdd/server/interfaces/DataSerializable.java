package io.mateu.ui.mdd.server.interfaces;

import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.UserData;

import javax.persistence.EntityManager;

public interface DataSerializable {

    Data toData(EntityManager em, UserData user);

    void fill(EntityManager em, UserData user, Data data);

}
