package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ConfirmDialog;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/confirm-dialog")
public class ConfirmDialogComponentPage implements ComponentTreeSupplier {

    boolean opened = true;

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Confirm dialog")
                .content(List.of(
                        ConfirmDialog.builder()
                                .header("Are you sure?")
                                .content(new Text("bla, bla, bla"))
                                .confirmActionId("confirm_action_id")
                                .confirmText("Yes, I want this to happen!")
                                .build()
                ))
                .build();
    }
}
