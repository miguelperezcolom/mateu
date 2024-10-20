package com.example.demo.infra.ui.menus.actions;

import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.CloseModal;

@Caption("Change age")
public class ChangeAgeForm {

    private final ActionsAsButtonsForm formWithCallbacks;

    int age;

    public ChangeAgeForm(int age, ActionsAsButtonsForm formWithCallbacks) {
        this.age = age;
        this.formWithCallbacks = formWithCallbacks;
    }

    @MainAction
    Object save() {
        //formWithCallbacks.age = this.age;
        // here we decide to close the modal by wrapping our response in a CloseModal object
        return new CloseModal<>(formWithCallbacks);
    }

}
