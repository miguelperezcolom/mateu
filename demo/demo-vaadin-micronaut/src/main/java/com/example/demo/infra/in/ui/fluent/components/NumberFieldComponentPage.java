package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/number-field")
public class NumberFieldComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Number field")
                .content(List.of(
                        FormField.builder()
                                .id("integer")
                                .label("Integer")
                                .dataType(FieldDataType.integer)
                                .build(),
                        FormField.builder()
                                .id("decimal")
                                .label("Decimal")
                                .dataType(FieldDataType.decimal)
                                .build()
                ))
                .build();
    }
}
