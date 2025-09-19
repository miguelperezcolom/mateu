package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/forms/boolean-fields")
public class FormBooleanFieldsComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Boolean form fields")
                .content(List.of(
                        new Text("${JSON.stringify(state)}"),
                        FormLayout.builder()
                                .autoResponsive(true)
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("boolean")
                                                                        .label("Boolean")
                                                                        .dataType(FieldDataType.bool)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("boolean")
                                                                        .label("Boolean/Toggle")
                                                                        .dataType(FieldDataType.bool)
                                                                        .stereotype(FieldStereotype.toggle)
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
