package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.ActionTarget;
import io.mateu.uidl.core.annotations.Caption;

@Caption("Decomposed")
public record DecomposedForm(PersonalData personalData, Address address) {


    @Action(target = ActionTarget.Message)
    String sayHello() {
        return "Name is " + personalData.name();
    }

}
