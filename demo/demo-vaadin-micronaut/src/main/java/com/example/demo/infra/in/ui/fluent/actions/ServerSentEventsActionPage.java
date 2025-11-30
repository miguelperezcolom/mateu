package com.example.demo.infra.in.ui.fluent.actions;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Route(value="/actions/server-side-events", parentRoute="^$")
public class ServerSentEventsActionPage implements ComponentTreeSupplier, ActionHandler, ActionSupplier {

    int count = 0;

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("SSE")
                .content(List.of(
                        VerticalLayout.builder()
                                .content(List.of(

                                        Text.builder()
                                                .text("${state.count}")
                                                .build(),

                                        Button.builder()
                                                .actionId("to-server")
                                                .label("Start incrementing")
                                                .build()
                                ))
                                .spacing(true)
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        List counts = new ArrayList();
        boolean first = true;
        while (first || count % 10 != 0) {
            first = false;
            counts.add(++count);
        }
        return Flux
                .fromStream(counts.stream())
                .map(count -> new State(Map.of("count", count)))
                .delayElements(Duration.ofMillis(100));
    }

    @Override
    public List<Action> actions() {
        return List.of(Action.builder()
                        .id("to-server")
                        .sse(true)
                .build());
    }
}
