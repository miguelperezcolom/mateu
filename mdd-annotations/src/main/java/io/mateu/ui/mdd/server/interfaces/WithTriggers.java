package io.mateu.ui.mdd.server.interfaces;

import javax.persistence.EntityManager;

/**
 * Created by miguel on 2/3/17.
 */
public interface WithTriggers {

    public void beforeSet(EntityManager em, boolean isNew) throws Throwable;

    public void afterSet(EntityManager em, boolean isNew) throws Exception, Throwable;

    public void beforeDelete(EntityManager em) throws Throwable;

    public void afterDelete(EntityManager em) throws Throwable;

}
