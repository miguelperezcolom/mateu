package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import io.mateu.dtos.ResultType;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class ChangeNameForm {

    String name;

    public ChangeNameForm() {
    }

    public ChangeNameForm(String name) {
        this.name = name;
    }

    @MainAction
    GoBack<String> save() {
        return new GoBack<>(ResultType.Ignored, null, name);
    }

}
