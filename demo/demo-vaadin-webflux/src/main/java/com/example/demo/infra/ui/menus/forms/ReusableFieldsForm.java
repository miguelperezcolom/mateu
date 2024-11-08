package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.FieldGroup;
import io.mateu.uidl.annotations.ReadOnly;

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
