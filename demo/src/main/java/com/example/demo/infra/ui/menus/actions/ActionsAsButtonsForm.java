package com.example.demo.infra.ui.menus.actions;

import com.example.demo.infra.ui.menus.forms.ChangeNameForm;
import io.mateu.core.domain.uidefinition.core.interfaces.HasCallback;
import io.mateu.core.domain.uidefinition.shared.annotations.Attached;
import io.mateu.core.domain.uidefinition.shared.annotations.Button;
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

    @Button
            @Attached
    Callable<ChangeNameForm> changeName = () -> new ChangeNameForm(name);

    @Button
    Runnable updateName = () -> name = UUID.randomUUID().toString();

    @Override
    public void callback(GoBack<String> data, ServerHttpRequest serverHttpRequest) {
        name = data.getData();
    }
}
