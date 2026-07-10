package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.MessageList;
import io.mateu.uidl.data.MessageListItem;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route(value="/components/building-blocks/message-list", parentRoute="")
public class MessageListComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Message list")
                .content(List.of(
                        MessageList.builder()
                                .items(List.of(
                                        new MessageListItem("**Hola equipo** — ¿habéis revisado el diseño?", "Ana García"),
                                        new MessageListItem("Sí, todo listo por mi parte ✅", "Sam Rivera")))
                                .build()
                ))
                .build();
    }
}
