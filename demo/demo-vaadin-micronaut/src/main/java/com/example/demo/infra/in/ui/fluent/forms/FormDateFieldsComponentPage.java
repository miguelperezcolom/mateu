package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/forms/date-fields")
public class FormDateFieldsComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Date form fields")
                .content(List.of(
                        new Text("${JSON.stringify(state)}"),
                        FormLayout.builder()
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("date")
                                                                        .label("Date")
                                                                        .dataType(FieldDataType.date)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("datetime")
                                                                        .label("DateTime")
                                                                        .dataType(FieldDataType.dateTime)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("time")
                                                                        .label("Time")
                                                                        .dataType(FieldDataType.time)
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
