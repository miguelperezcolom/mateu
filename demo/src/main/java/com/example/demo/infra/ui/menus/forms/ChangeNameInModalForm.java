package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class ChangeNameInModalForm {

    private final ModalsForm formWithCallbacks;

    String name;

    public ChangeNameInModalForm(String name, ModalsForm formWithCallbacks) {
        this.name = name;
        this.formWithCallbacks = formWithCallbacks;
    }

    @MainAction
    ModalsForm save() {
        formWithCallbacks.name = this.name;
        return formWithCallbacks;
    }

}
