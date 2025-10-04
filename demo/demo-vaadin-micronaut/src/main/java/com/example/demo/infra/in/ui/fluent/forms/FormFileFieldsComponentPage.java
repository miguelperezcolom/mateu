package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.File;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

import static io.mateu.core.infra.JsonSerializer.toJson;

@Route("/fluent-app/forms/file-fields")
public class FormFileFieldsComponentPage implements ComponentTreeSupplier, ActionHandler {

    File[] file = {new File("xx", "fichero.png")};

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("File form fields")
                .content(List.of(
                        new Text("${JSON.stringify(state)}"),
                        FormLayout.builder()
                                .autoResponsive(true)
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("file")
                                                                        .label("File")
                                                                        .dataType(FieldDataType.file)
                                                                        .build()
                                                        ))
                                                        .build()
                                        )
                                )
                                .build(),
                        Button.builder()
                                .label("Send")
                                .actionId("send")
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        System.out.println(toJson(this));
        return this;
    }
}
