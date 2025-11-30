package com.example.demo.infra.in.ui.fluent.commandsandmessages;


import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Route(value="/commands-and-messages/set-window-title", parentRoute="^$")
@Schema
public class SetWindowTitlePage implements ComponentTreeSupplier, ActionHandler {

    String title = "";

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Set Window Title")
                                .toolbar(List.of(
                                        Button.builder()
                                                .label("Set window title")
                                                .build()
                                ))
                                .content(List.of(
                                        FormField.builder()
                                                .id("title")
                                                .label("New window title")
                                                .dataType(FieldDataType.string)
                                                .build()
                                ))
                                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("setWindowTitle".equals(actionId)) {
            return UICommand.builder().type(UICommandType.SetWindowTitle).data(title).build();
        }
        return null;
    }

}