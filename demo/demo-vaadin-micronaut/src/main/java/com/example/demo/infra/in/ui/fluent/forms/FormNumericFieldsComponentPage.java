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

@Route("/fluent-app/forms/numeric-fields")
public class FormNumericFieldsComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Form fields")
                .content(List.of(
                        new Text("${JSON.stringify(state)}"),
                        FormLayout.builder()
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("integer")
                                                                        .label("Integer")
                                                                        .dataType(FieldDataType.integer)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("decimal")
                                                                        .label("Decimal")
                                                                        .dataType(FieldDataType.number)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("money")
                                                                        .label("Money")
                                                                        .dataType(FieldDataType.money)
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
