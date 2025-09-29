package com.example.demo.infra.in.ui.fluent.commandsandmessages;


import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Route("/fluent-app/commands-and-messages/set-favicon")
@Schema
public class SetFaviconPage implements ComponentTreeSupplier, HandlesActions {

    String favIcon = "";

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Set Favicon")
                                .toolbar(List.of(
                                        Button.builder()
                                                .label("Set favicon")
                                                .build()
                                ))
                                .content(List.of(
                                        FormField.builder()
                                                .id("favIcon")
                                                .label("FavIcon")
                                                .dataType(FieldDataType.string)
                                                .stereotype(FieldStereotype.radio)
                                                .options(List.of(
                                                        new Option("/images/favicons/mateu.png"),
                                                        new Option("/images/favicons/phenix_blue.svg"),
                                                        new Option("/images/favicons/vaadin-logo.svg")
                                                ))
                                                .build()
                                ))
                                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("setFavicon".equals(actionId)) {
            return UICommand.builder().type(UICommandType.SetFavicon).data(favIcon).build();
        }
        return null;
    }

}