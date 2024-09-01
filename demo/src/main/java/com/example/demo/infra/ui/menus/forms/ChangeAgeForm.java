package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import io.mateu.dtos.ResultType;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class ChangeAgeForm {

    private final FormWithCallbacks formWithCallbacks;

    int age;

    public ChangeAgeForm(int age, FormWithCallbacks formWithCallbacks) {
        this.age = age;
        this.formWithCallbacks = formWithCallbacks;
    }


    @MainAction
    FormWithCallbacks save() {
        formWithCallbacks.age = this.age;
        return formWithCallbacks;
    }


}
