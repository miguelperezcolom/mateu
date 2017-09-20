package io.mateu.ui.mdd.server.interfaces;

import javax.persistence.EntityManager;

/**
 * Created by miguel on 10/3/17.
 */
public interface AuditRecord {

    public void touch(EntityManager em, String login);

}
