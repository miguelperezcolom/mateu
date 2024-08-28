package com.example.demo.infra.ui.menus.actions;

import com.example.demo.infra.ui.menus.forms.FormWithCallbacks;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.CloseModal;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class ChangeNameForm {

    private final ActionsAsButtonsForm formWithCallbacks;

    String name;

    public ChangeNameForm(String name, ActionsAsButtonsForm formWithCallbacks) {
        this.name = name;
        this.formWithCallbacks = formWithCallbacks;
    }

    @MainAction
    CloseModal<ActionsAsButtonsForm> save() {
        formWithCallbacks.name = this.name;
        return new CloseModal<>(formWithCallbacks);
    }

}
