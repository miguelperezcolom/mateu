package com.example.demo.infra.ui.menus.components.forms.actions;

import io.mateu.uidl.annotations.ActionTarget;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.Title;

@Title("Change name")
public class ChangeNameForm {

    private final ActionsAsButtonsForm formWithCallbacks;

    String name;

    public ChangeNameForm(String name, ActionsAsButtonsForm formWithCallbacks) {
        this.name = name;
        this.formWithCallbacks = formWithCallbacks;
    }

    @MainAction(target = ActionTarget.View, closeModalWindow = true)
    ActionsAsButtonsForm save() {
        formWithCallbacks.name = this.name;
        return formWithCallbacks;
    }

}
