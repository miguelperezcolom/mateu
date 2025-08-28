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

@Route("/fluent-app/forms/all-fields")
public class FormFieldComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Form fields")
                .content(List.of(
                        FormLayout.builder()
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String")
                                                                        .dataType(FieldDataType.string)
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Password")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.password)
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Link")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.link)
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Html")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.html)
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Icon")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.icon)
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Email")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.email)
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Textarea")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.textarea)
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Radio")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.radio)
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Checkbox")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.checkbox)
                                                                        .options(List.of(
                                                                                new Option("1", "Uno"),
                                                                                new Option("2", "Dos"),
                                                                                new Option("3", "Tres")
                                                                        ))
                                                                        .build(),

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
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/ComboBox")
                                                                        .dataType(FieldDataType.status)
                                                                        .stereotype(FieldStereotype.combobox)
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Image")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.image)
                                                                        .build(),

                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/RichText")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.richText)
                                                                        .build()


                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("integer")
                                                                        .label("Integer")
                                                                        .dataType(FieldDataType.integer)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("decimal")
                                                                        .label("Decimal")
                                                                        .dataType(FieldDataType.decimal)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("boolean")
                                                                        .label("Boolean")
                                                                        .dataType(FieldDataType.bool)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("money")
                                                                        .label("Money")
                                                                        .dataType(FieldDataType.money)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("date")
                                                                        .label("Date")
                                                                        .dataType(FieldDataType.date)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("datetime")
                                                                        .label("DateTime")
                                                                        .dataType(FieldDataType.dateTime)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("time")
                                                                        .label("Time")
                                                                        .dataType(FieldDataType.time)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("status")
                                                                        .label("Status")
                                                                        .dataType(FieldDataType.status)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("component")
                                                                        .label("Component")
                                                                        .dataType(FieldDataType.component)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("array")
                                                                        .label("Array")
                                                                        .dataType(FieldDataType.array)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("file")
                                                                        .label("File")
                                                                        .dataType(FieldDataType.file)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("reference")
                                                                        .label("Reference")
                                                                        .dataType(FieldDataType.reference)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("menu")
                                                                        .label("Menu")
                                                                        .dataType(FieldDataType.menu)
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
