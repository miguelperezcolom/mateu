package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.CloseModal;
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
