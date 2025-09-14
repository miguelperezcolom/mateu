package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/forms/other-fields")
public class FormOtherFieldsComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Other form fields")
                .content(List.of(
                        new Text("${JSON.stringify(state)}"),
                        FormLayout.builder()
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
                                                                FormField.builder()
                                                                        .id("component")
                                                                        .label("Component")
                                                                        .dataType(FieldDataType.component)
                                                                        .build()
                                                        ))
                                                        .build(),

                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("reference")
                                                                        .label("Reference")
                                                                        .dataType(FieldDataType.reference)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("menu")
                                                                        .label("Menu")
                                                                        .dataType(FieldDataType.menu)
                                                                        .build()
                                                        ))
                                                        .build()

                                        )
                                )
                                .maxColumns(5)
                                .build()
                ))
                .build();
    }
}
