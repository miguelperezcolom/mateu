package com.example.demo.infra.in.ui.fluent.actions;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.CustomEvent;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnCustomEventTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;
import lombok.extern.slf4j.Slf4j;

import java.util.List;


@Serdeable
record Detail(String a, int b) {

}

@Serdeable
class CustomEventActionComponent implements ComponentTreeSupplier, ActionSupplier {

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Nested component")
                .content(List.of(
                        VerticalLayout.builder()
                                .content(List.of(

                                        Text.builder()
                                                .text("${state.count}")
                                                .build(),

                                        Button.builder()
                                                .actionId("action")
                                                .label("Count")
                                                .build(),

                                        Button.builder()
                                                .actionId("to-server")
                                                .label("To server")
                                                .build()
                                ))
                                .spacing(true)
                                .build()
                ))
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(Action.builder()
                .id("action")
                .customEvent(new CustomEvent("my-event", new Detail("xxxx", 3535)))
                .build(),
                Action.builder()
                        .id("to-server")
                        .customEvent(new CustomEvent("my-event-to-server", new Detail("yyy", 123)))
                        .build());
    }
}


@Route("/fluent-app/actions/custom-event")
@Slf4j
public class CustomEventActionPage implements ComponentTreeSupplier, ActionSupplier, TriggersSupplier, HandlesActions {

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Run action in browser")
                .content(List.of(
                        new CustomEventActionComponent()
                        ))
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(Action.builder()
                .id("wrapper-action")
                .js("console.log('captured custom event', detail); alert('got it!');")
                .build());
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(
                new OnCustomEventTrigger("wrapper-action", "my-event"),
                new OnCustomEventTrigger("server-action", "my-event-to-server")
        );
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        log.info("received {}: {}", actionId, httpRequest.runActionRq().parameters());
        return null;
    }
}
