package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/forms/other-fields")
public class FormOtherFieldsComponentPage implements ComponentTreeSupplier {

    Status status = new Status(StatusType.SUCCESS, "It works!");

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Other form fields")
                .content(List.of(
                        new Text("${JSON.stringify(state)}"),
                        FormLayout.builder()
                                .autoResponsive(true)
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("status")
                                                                        .label("Status")
                                                                        .dataType(FieldDataType.status)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                CustomField.builder()
                                                                        .label("Component")
                                                                        .content(new Text("Hola!"))
                                                                        .build()
                                                        ))
                                                        .build()

                                        )
                                )
                                .build()
                ))
                .build();
    }
}
