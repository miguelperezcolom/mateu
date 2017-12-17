package io.mateu.ui.mdd.server.interfaces;

import io.mateu.ui.core.shared.UserData;

import javax.persistence.EntityManager;

public interface Filtered {

    public String getAdditionalCriteria(EntityManager em, UserData user);
}
