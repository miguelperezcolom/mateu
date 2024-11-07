package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.FieldGroup;
import io.mateu.uidl.core.annotations.ReadOnly;

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
