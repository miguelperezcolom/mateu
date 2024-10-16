package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;

public class ReusableFieldsForm {

    @FieldGroup("Customer")
    CustomerRef customer;

    @FieldGroup("Country")
    CountryRef country;


    @ReadOnly
    String assess;

    @Action
    void assess() {
        assess = "" + customer.code + " " + country.codeOf;
    }

}
