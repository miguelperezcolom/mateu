package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ConfirmDialog;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/confirm-dialog")
public class ConfirmDialogComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Confirm dialog")
                .content(List.of(
                        ConfirmDialog.builder()
                                .title("Title")
                                .text("bla, bla, bla")
                                .build()
                ))
                .build();
    }
}
