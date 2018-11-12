package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.core.data.Data;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.data.Data;
import io.mateu.mdd.core.data.UserData;

import javax.persistence.EntityManager;

public interface DataSerializable {

    Data toData(EntityManager em, UserData user);

    void fill(EntityManager em, UserData user, Data data);

}
