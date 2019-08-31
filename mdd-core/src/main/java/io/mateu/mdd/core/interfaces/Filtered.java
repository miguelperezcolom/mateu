package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.core.data.UserData;

import javax.persistence.EntityManager;

public interface Filtered {

    public String getAdditionalCriteria(EntityManager em, UserData user);
}
