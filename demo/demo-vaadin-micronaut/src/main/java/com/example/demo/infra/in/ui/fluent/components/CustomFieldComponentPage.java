package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/custom-field")
public class CustomFieldComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Custom field")
                .content(List.of(
                        CustomField.builder()
                                .label("Custom field")
                                .content(new HorizontalLayout(List.of(
                                        FormField.builder()
                                                .id("name")
                                                .dataType(FieldDataType.string)
                                                .build(),
                                        FormField.builder()
                                                .id("password")
                                                .dataType(FieldDataType.string)
                                                .stereotype(FieldStereotype.password)
                                                .build()
                                )))
                                .build()
                ))
                .build();
    }
}
