package io.mateu.ui.mdd.server.interfaces;

import io.mateu.ui.core.client.views.AbstractForm;
import io.mateu.ui.core.shared.UserData;

import javax.persistence.EntityManager;

public interface FormOwner {

    AbstractForm getForm(EntityManager em, UserData user);

}
