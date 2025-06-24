package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Field;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/list-box")
public class ListBoxComponentPage implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("List box")
                .content(List.of(
                        Field.builder()
                                .id("string")
                                .label("String")
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.listBox)
                                .options(List.of(
                                        new Option("1", "Uno", ""),
                                        new Option("2", "Dos", ""),
                                        new Option("3", "Tres", "")
                                ))
                                .build(),
                        Field.builder()
                                .id("ref")
                                .label("Reference")
                                .dataType(FieldDataType.reference)
                                .stereotype(FieldStereotype.listBox)
                                .options(List.of(
                                        new Option("1", "Uno", ""),
                                        new Option("2", "Dos", ""),
                                        new Option("3", "Tres", "")
                                ))
                                .build(),
                        Field.builder()
                                .id("array")
                                .label("Array")
                                .dataType(FieldDataType.array)
                                .stereotype(FieldStereotype.listBox)
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
