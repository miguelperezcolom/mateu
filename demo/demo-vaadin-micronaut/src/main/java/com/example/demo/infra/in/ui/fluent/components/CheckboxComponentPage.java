package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Field;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/checkbox")
public class CheckboxComponentPage implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Checkbox")
                .content(List.of(
                        Field.builder()
                                .id("name")
                                .label("Name")
                                .dataType(FieldDataType.bool)
                                .build()
                ))
                .build();
    }
}
