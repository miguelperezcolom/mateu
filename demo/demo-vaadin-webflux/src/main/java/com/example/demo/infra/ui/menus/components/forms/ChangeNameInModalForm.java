package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.ActionTarget;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.data.CloseModal;
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

    @MainAction(target = ActionTarget.View)
    CloseModal<ModalsForm> save() {
        formWithCallbacks.name = this.name;
        return new CloseModal<>(formWithCallbacks);
    }

}
