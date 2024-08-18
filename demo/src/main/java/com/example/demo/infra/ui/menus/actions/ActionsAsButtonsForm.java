package com.example.demo.infra.ui.menus.actions;

import com.example.demo.infra.ui.menus.forms.ChangeNameForm;
import io.mateu.core.domain.uidefinition.core.interfaces.HasCallback;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.Callable;

@Service
@Getter@Setter
public class ActionsAsButtonsForm implements HasCallback<String> {

    String name = "Mateu";

    @Button(target = ActionTarget.NewModal)
            @SameLine
    @FlexGrow("0")
    Callable<ChangeNameForm> changeName = () -> new ChangeNameForm(name);

    @Button(type = ActionType.Secondary)
    Runnable updateName = () -> name = UUID.randomUUID().toString();

    @Override
    public void callback(GoBack<String> data, ServerHttpRequest serverHttpRequest) {
        name = data.getData();
    }
}
