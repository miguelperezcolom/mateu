package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;

public class ReusableFieldsForm {

    CountryRef country;

    CustomerRef customer;

    @ReadOnly
    String assess;

    @Action
    void assess() {
        assess = "" + customer.code + " " + country.code;
    }

}
