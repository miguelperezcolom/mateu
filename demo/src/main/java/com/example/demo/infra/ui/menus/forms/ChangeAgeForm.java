package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import io.mateu.dtos.ResultType;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class ChangeAgeForm {

    int age;

    public ChangeAgeForm() {
    }

    public ChangeAgeForm(int age) {
        this.age = age;
    }

    @MainAction
    GoBack<Integer> save() {
        return new GoBack<>(ResultType.Ignored, null, age);
    }

}
