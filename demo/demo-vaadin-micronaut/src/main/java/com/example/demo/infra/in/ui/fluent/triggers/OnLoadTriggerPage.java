package com.example.demo.infra.in.ui.fluent.triggers;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasActions;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnErrorTrigger;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.SneakyThrows;

import java.util.List;

@Route("/fluent-app/triggers/on-load")
public class OnLoadTriggerPage implements ComponentTreeSupplier, HasActions, HasTriggers {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("On load trigger")
                .content(List.of(
                ))
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(
                Action.builder()
                        .id("action")
                        .js("alert('loaded!')")
                        .build()
        );
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(
                new OnLoadTrigger("action", 0, 0, null)
        );
    }

}