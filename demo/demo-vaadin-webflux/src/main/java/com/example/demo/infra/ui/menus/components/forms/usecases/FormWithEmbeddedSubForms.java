package com.example.demo.infra.ui.menus.components.forms.usecases;

import com.example.demo.infra.ui.menus.components.forms.Address;
import io.mateu.uidl.annotations.ActionTarget;
import io.mateu.uidl.annotations.MainAction;

public class FormWithEmbeddedSubForms {

    private String name;

    private Address address;

    private Address invoicingAddress;

    @MainAction(target = ActionTarget.Message)
    public String assess() {
        return "Hello " + name + "!, you live in " + address + " and we will invoice you to " + invoicingAddress;
    }

}
