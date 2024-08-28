package com.example.demo.infra.ui.menus.actions;

import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.Callable;

@Service
@Getter@Setter
public class ActionsAsButtonsForm {

    String name = "Mateu";

    @Button(target = ActionTarget.NewModal)
            @SameLine
    @FlexGrow("0")
    Callable<ChangeNameForm> changeName = () -> new ChangeNameForm(name, this);

    @Button(type = ActionType.Secondary)
    Runnable updateName = () -> name = UUID.randomUUID().toString();

}
