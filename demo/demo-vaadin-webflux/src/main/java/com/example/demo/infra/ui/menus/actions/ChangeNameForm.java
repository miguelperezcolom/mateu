package com.example.demo.infra.ui.menus.actions;

import io.mateu.uidl.core.annotations.ActionTarget;
import io.mateu.uidl.core.annotations.Caption;
import io.mateu.uidl.core.annotations.MainAction;

@Caption("Change name")
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
