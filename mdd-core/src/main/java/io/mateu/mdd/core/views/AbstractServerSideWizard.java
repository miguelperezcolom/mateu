package io.mateu.mdd.core.views;

import io.mateu.mdd.core.data.Data;
import io.mateu.mdd.core.data.UserData;

import javax.persistence.EntityManager;

/**
 * Created by miguel on 23/4/17.
 */
public abstract class AbstractServerSideWizard {

    public abstract AbstractServerSideWizardPage execute(UserData user, EntityManager em, String action, Data data) throws Throwable;

}
