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

@Route("/forms/choice-fields")
public class FormChoicesFieldsComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Choice form fields")
                .content(List.of(
                        new Text("${JSON.stringify(state)}"),
                        FormLayout.builder()
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Radio")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.radio)
                                                                        .options(List.of(
                                                                                new Option("1", "Uno"),
                                                                                new Option("2", "Dos"),
                                                                                new Option("3", "Tres")
                                                                        ))
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Select")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.select)
                                                                        .options(List.of(
                                                                                new Option("1", "Uno"),
                                                                                new Option("2", "Dos"),
                                                                                new Option("3", "Tres")
                                                                        ))
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/ListBox")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.listBox)
                                                                        .options(List.of(
                                                                                new Option("1", "Uno"),
                                                                                new Option("2", "Dos"),
                                                                                new Option("3", "Tres")
                                                                        ))
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/ComboBox")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.combobox)
                                                                        .options(List.of(
                                                                                new Option("1", "Uno"),
                                                                                new Option("2", "Dos"),
                                                                                new Option("3", "Tres")
                                                                        ))
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Choice")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.choice)
                                                                        .options(List.of(
                                                                                new Option("1", "Uno"),
                                                                                new Option("2", "Dos"),
                                                                                new Option("3", "Tres")
                                                                        ))
                                                                        .build()
                                                        )).build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Popover")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.popover)
                                                                        .options(List.of(
                                                                                new Option("1", "Uno"),
                                                                                new Option("2", "Dos"),
                                                                                new Option("3", "Tres")
                                                                        ))
                                                                        .build()
                                                        )).build()
                                                                )
                                )
                                .maxColumns(5)
                                .build()
                ))
                .build();
    }
}
