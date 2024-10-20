package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import io.mateu.dtos.ResultType;
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
