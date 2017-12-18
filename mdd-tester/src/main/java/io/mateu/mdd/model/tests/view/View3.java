package io.mateu.mdd.model.tests.view;

import io.mateu.ui.core.shared.UserData;
import io.mateu.ui.mdd.server.annotations.Action;
import io.mateu.ui.mdd.server.interfaces.Filtered;
import io.mateu.ui.mdd.server.interfaces.View;

import javax.persistence.EntityManager;

public class View3 implements View<Booking> {

    @Override
    public String getFields() {
        return "leadname, agency.name, cost, sale";
    }

    @Override
    public String getParams() {
        return "leadname";
    }

    @Override
    public String getCols() {
        return "id, agency.name, leadname, cost, sale";
    }

    @Override
    public String getOrderCriteria() {
        return null;
    }

}
