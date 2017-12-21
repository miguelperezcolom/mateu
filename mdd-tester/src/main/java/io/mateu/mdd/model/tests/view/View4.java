package io.mateu.mdd.model.tests.view;

import io.mateu.ui.mdd.server.interfaces.View;

public class View4 implements View<Booking> {

    @Override
    public String getFields() {
        return "-leadName, ¬agency, ¬lines";
    }

    @Override
    public boolean isFieldsListedOnly() {
        return false;
    }

    @Override
    public String getParams() {
        return "leadName";
    }

    @Override
    public String getCols() {
        return "id, agency.name, leadName, cost, sale";
    }

    @Override
    public String getOrderCriteria() {
        return null;
    }

}
