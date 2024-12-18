package com.example.demo.infra.ui.menus.actions;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.CloseModal;

@Title("Change age")
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
