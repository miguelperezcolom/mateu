package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.core.interfaces.HasCallback;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@Getter
@Setter
@Scope("stereotype")
public class FormWithCallbacks implements HasCallback<Object> {

    String name = "Mateu";

    int age = 16;

    @Action
    ChangeNameForm changeName() {
        return new ChangeNameForm(name);
    }

    @Action
    ChangeAgeForm changeAge() {
        return new ChangeAgeForm(age);
    }


    @Override
    public void callback(GoBack<Object> data, ServerHttpRequest serverHttpRequest) {
        if (data.getData() instanceof String string) {
            name = string;
        }
        if (data.getData() instanceof Integer integer) {
            age = integer;
        }
    }
}
