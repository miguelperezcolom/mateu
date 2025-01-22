package com.example.demo.infra.ui.menus;

import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.data.Destination;
import io.mateu.uidl.data.DestinationType;
import io.mateu.uidl.data.Result;
import io.mateu.uidl.data.ResultType;
import io.mateu.uidl.interfaces.ActionHandler;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.List;

public class ResultsSubmenu implements ActionHandler {

    @MenuOption
    private Result result = new Result(
            "This is the result",
            ResultType.Success,
            "This is the message",
            List.of(
                    new Destination("yyy", DestinationType.View, "Go to yyy", null),
                    new Destination("zzz", DestinationType.View, "Go to zzz", null)
            ),
            new Destination("xxx", DestinationType.View, "Go to xxx", null),
            null,
            this
    );

    @Override
    public Object handle(Object target, String actionId, ServerHttpRequest serverHttpRequest) {
        return switch (actionId) {
            case "xxx" -> "Hello xxx!";
            case "yyy" -> "Hello yyy!";
            case "zzz" -> "Hello zzz!";
            default -> throw new IllegalStateException("Unexpected value: " + actionId);
        };
    }
}
