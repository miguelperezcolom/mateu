package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;

@Caption("Decomposed")
public record DecomposedForm(PersonalData personalData, Address address) {


    @Action(target = ActionTarget.Message)
    String sayHello() {
        return "Name is " + personalData.name();
    }

}
