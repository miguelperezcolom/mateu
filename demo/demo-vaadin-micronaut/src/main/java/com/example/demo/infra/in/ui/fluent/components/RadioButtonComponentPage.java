package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/radio-button")
public class RadioButtonComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Radio button")
                .content(List.of(
                        FormField.builder()
                                .id("string")
                                .label("String")
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.radio)
                                .options(List.of(
                                        new Option("1", "Uno", ""),
                                        new Option("2", "Dos", ""),
                                        new Option("3", "Tres", "")
                                ))
                                .build(),
                        FormField.builder()
                                .id("name")
                                .label("Name")
                                .dataType(FieldDataType.reference)
                                .stereotype(FieldStereotype.radio)
                                .options(List.of(
                                        new Option("1", "Uno", ""),
                                        new Option("2", "Dos", ""),
                                        new Option("3", "Tres", "")
                                ))
                                .build()
                ))
                .build();
    }
}
