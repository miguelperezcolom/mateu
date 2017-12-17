package io.mateu.mdd.model.tests.view;

import io.mateu.ui.mdd.server.interfaces.View;

public class View2 implements View<Booking> {

    @Override
    public String getFields() {
        return "leadname, start, end, confirmed";
    }

    @Override
    public String getParams() {
        return "leadname";
    }

    @Override
    public String getCols() {
        return "id, leadname, cost, sale";
    }

    @Override
    public String getOrderCriteria() {
        return "confirmed";
    }
}
