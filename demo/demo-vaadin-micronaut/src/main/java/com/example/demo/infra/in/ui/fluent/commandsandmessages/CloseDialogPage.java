package com.example.demo.infra.in.ui.fluent.commandsandmessages;


import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

import java.util.List;

@Route("/fluent-app/commands-and-messages/close-dialog")
@Schema
@Slf4j
public class CloseDialogPage implements ComponentTreeSupplier, HandlesActions {

    @Override
    public Component component(HttpRequest httpRequest) {
        return VerticalLayout.builder()
                .content(List.of(
                        Button.builder()
                                .label("Open dialog")
                                .actionId("open-dialog")
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("open-dialog".equals(actionId)) {
            log.info("open dialog {}", actionId);
            return Dialog.builder()
                    .closeButtonOnHeader(true)
                    .content(Form.builder()
                            .title("Dialog form")
                            .content(List.of(
                                    Button.builder()
                                            .label("Close dialog")
                                            .actionId("close-dialog")
                                            .build()
                            ))
                            .build())
                    .build();
        }
        if ("close-dialog".equals(actionId)) {
            log.info("close dialog {}", actionId);
            return UICommand.builder().type(UICommandType.CloseModal).build();
        }
        return null;
    }

}