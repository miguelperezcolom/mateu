package com.example.demo.infra.ui.menus.actions;

import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;

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
