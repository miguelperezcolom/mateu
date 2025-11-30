package com.example.demo.infra.in.ui.fluent.commandsandmessages;


import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Route(value="/commands-and-messages/run-action", parentRoute="^$")
@Schema
public class RunActionPage implements ComponentTreeSupplier, ActionHandler {

    @Override
    public Component component(HttpRequest httpRequest) {

        return Form.builder()
                .title("Run action")
                .toolbar(List.of(
                        Button.builder()
                                .label("Run action")
                                .build()
                ))
                .content(List.of(
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("action-2".equals(actionId)) {
            return Message.builder().text(actionId).build();
        }
        return UICommand.runAction("action-2");
    }

}