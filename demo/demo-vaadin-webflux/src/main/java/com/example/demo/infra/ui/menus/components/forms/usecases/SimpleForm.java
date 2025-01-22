package com.example.demo.infra.ui.menus.components.forms.usecases;

import io.mateu.uidl.annotations.ActionTarget;
import io.mateu.uidl.annotations.MainAction;
import jakarta.validation.constraints.NotEmpty;

public class SimpleForm {

    @NotEmpty
    String name;

    int age;

    @MainAction(target = ActionTarget.Message)
    String sayHello() {
        return "Hello " + name;
    }

}
