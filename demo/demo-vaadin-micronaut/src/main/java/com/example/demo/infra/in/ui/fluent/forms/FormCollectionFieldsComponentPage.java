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

@Route("/fluent-app/forms/collection-fields")
public class FormCollectionFieldsComponentPage implements ComponentTreeSupplier {
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
                                                                        .id("array")
                                                                        .label("Array/Checkbox")
                                                                        .dataType(FieldDataType.array)
                                                                        .stereotype(FieldStereotype.checkbox)
                                                                        .options(List.of(
                                                                                new Option("1", "Uno"),
                                                                                new Option("2", "Dos"),
                                                                                new Option("3", "Tres")
                                                                        ))
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("array")
                                                                        .label("String/Combobox")
                                                                        .dataType(FieldDataType.array)
                                                                        .stereotype(FieldStereotype.combobox)
                                                                        .options(List.of(
                                                                                new Option("1", "Uno"),
                                                                                new Option("2", "Dos"),
                                                                                new Option("3", "Tres")
                                                                        ))
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("array")
                                                                        .label("Array/ListBox")
                                                                        .dataType(FieldDataType.array)
                                                                        .stereotype(FieldStereotype.listBox)
                                                                        .options(List.of(
                                                                                new Option("1", "Uno"),
                                                                                new Option("2", "Dos"),
                                                                                new Option("3", "Tres")
                                                                        ))
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
