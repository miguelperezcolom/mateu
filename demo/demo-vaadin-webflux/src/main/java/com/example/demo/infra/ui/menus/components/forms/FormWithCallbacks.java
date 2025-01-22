package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.Action;
import lombok.Getter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Getter
@Scope("prototype")
public class FormWithCallbacks {

    String name = "Mateu";

    int age = 16;

    @Action
    ChangeNameForm changeName() {
        return new ChangeNameForm(name, this);
    }

    @Action
    ChangeAgeForm changeAge() {
        return new ChangeAgeForm(age, this);
    }
}
