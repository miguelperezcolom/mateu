package io.mateu.ui.mdd.server;

import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.UserData;

import javax.persistence.EntityManager;

public abstract class AbstractServerSideWizardPage {

    public abstract String getTitle();

    /**
     * devuelve los datos (adicionales) que debene añadirse al modelo de la página.
     * recibe como parámetro los datos del wizard (valores de los campos rellenados en las paginas anteriores del wizard
     */
    public Data getData(UserData user, EntityManager em, Data in) throws Throwable {
        return null;
    }

    public void fill(EntityManager em, Data data) throws Throwable {
        ERPServiceImpl.fillEntity(em, this, data, false);
    }
}
