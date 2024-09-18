package com.example.demo.infra.ui.menus.actions;

import io.mateu.core.domain.uidefinition.shared.annotations.*;
import org.springframework.stereotype.Service;

import java.util.concurrent.Callable;

@Service
@Caption("Actions as buttons")
public class ActionsAsButtonsForm {

    String name = "Mateu";

    @Button(target = ActionTarget.NewModal)
    @SameLine
    @FlexGrow("0")
    Callable<ChangeNameForm> changeName = () -> new ChangeNameForm(name, this);

    int age = 16;

    @Button(target = ActionTarget.NewModal)
    @SameLine
    @FlexGrow("0")
    Callable<ChangeAgeForm> changeAge = () -> new ChangeAgeForm(age, this);

}
