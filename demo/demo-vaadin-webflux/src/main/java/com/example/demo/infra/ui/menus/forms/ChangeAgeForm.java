package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.MainAction;
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
