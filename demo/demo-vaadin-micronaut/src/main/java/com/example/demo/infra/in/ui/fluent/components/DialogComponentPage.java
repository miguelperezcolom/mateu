package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/components/dialog")
public class DialogComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Dialog")
                .content(List.of(

                        Dialog.builder()
                                .headerTitle("Title")
                                .content(new Text("Hola!"))
                                .closeButtonOnHeader(true)
                                .build()

                ))
                .build();
    }
}
