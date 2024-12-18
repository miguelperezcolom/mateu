package com.example.demo.infra.ui.menus.actions;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Label;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.Callable;

@Service
@Title("Actions")
public class ActionsAsButtonsForm {

    String name = "Mateu";

    @Button(target = ActionTarget.NewModal)
    @SameLine
    @FlexGrow("0")
    Callable<ChangeNameForm> changeName = () -> new ChangeNameForm(name, this);

    @Button(type = ActionType.Secondary)
    Runnable setRandomName = () -> name = UUID.randomUUID().toString();

    @Action
    void thisIsAnAction() {

    }

    @MainAction(type = ActionType.Tertiary, position = ActionPosition.Left)
    void yetAnotherMainAction() {

    }

    @MainAction(type = ActionType.Secondary)
    void anotherMainAction() {

    }

    @MainAction
    void aMainAction() {

    }

}
