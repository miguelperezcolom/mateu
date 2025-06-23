package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Details;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/dialog")
public class DialogComponentPage implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Dialog")
                .content(List.of(
                        Dialog.builder()
                                .title("Title")
                                .content(new Text("Hola!"))
                                .build()
                ))
                .build();
    }
}
