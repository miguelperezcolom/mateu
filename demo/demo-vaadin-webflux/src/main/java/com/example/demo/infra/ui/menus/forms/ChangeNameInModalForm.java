package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.ActionTarget;
import io.mateu.uidl.core.annotations.MainAction;
import io.mateu.uidl.core.data.CloseModal;
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
