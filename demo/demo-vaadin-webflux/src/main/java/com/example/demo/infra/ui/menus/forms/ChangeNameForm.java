package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.MainAction;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class ChangeNameForm {

    private final FormWithCallbacks formWithCallbacks;

    String name;

    public ChangeNameForm(String name, FormWithCallbacks formWithCallbacks) {
        this.name = name;
        this.formWithCallbacks = formWithCallbacks;
    }

    @MainAction
    FormWithCallbacks save() {
        formWithCallbacks.name = this.name;
        return formWithCallbacks;
    }

}
