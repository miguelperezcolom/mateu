package com.example.demo.infra.in.ui.fluent.commandsandmessages;


import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Route("/commands-and-messages/message")
@Schema
public class MessagePage implements ComponentTreeSupplier, ActionHandler {

    @Override
    public Component component(HttpRequest httpRequest) {
        return VerticalLayout.builder()
                .content(List.of(
                        Form.builder()
                                .content(List.of(
                                        Button.builder()
                                                .label("Show message")
                                                .build()
                                ))
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("showMessage".equals(actionId)) {
            return Message.builder().text("Hello!").build();
        }
        return null;
    }

}