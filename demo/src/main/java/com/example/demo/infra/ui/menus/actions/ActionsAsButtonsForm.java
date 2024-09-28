package com.example.demo.infra.ui.menus.actions;

import io.mateu.core.domain.uidefinition.shared.annotations.*;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.Callable;

@Service
@Caption("Actions")
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
