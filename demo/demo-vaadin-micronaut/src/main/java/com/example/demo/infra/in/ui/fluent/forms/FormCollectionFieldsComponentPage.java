package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.CustomField;
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
import jakarta.inject.Singleton;

import java.util.List;

@Route("/forms/collection-fields")
@Singleton
public class FormCollectionFieldsComponentPage implements ComponentTreeSupplier {

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Form fields")
                .content(List.of(
                        FormLayout.builder()
                                .autoResponsive(true)
                                .maxColumns(6)
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
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("array")
                                                                        .label("Array/Choice")
                                                                        .dataType(FieldDataType.array)
                                                                        .stereotype(FieldStereotype.choice)
                                                                        .options(List.of(
                                                                                new Option("1", "Uno"),
                                                                                new Option("2", "Dos"),
                                                                                new Option("3", "Tres")
                                                                        ))
                                                                        .colspan(3)
                                                                        .build(),
                                                                CustomField.builder()
                                                                        .label("State")
                                                                        .content(new Text("${JSON.stringify(state)}"))
                                                                        .colspan(3)
                                                                        .build()

                                                        ))
                                                        .build()

                                        )
                                )
                                .build()
                        ))
                .build();
    }


}
