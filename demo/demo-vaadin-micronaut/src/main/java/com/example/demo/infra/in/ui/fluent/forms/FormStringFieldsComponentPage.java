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

@Route("/fluent-app/forms/string-fields")
public class FormStringFieldsComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("String form fields")
                .content(List.of(
                        new Text("${JSON.stringify(state)}"),
                        FormLayout.builder()
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String")
                                                                        .dataType(FieldDataType.string)
                                                                        .readOnly(true)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Link")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.link)
                                                                        .readOnly(true)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Html")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.html)
                                                                        .readOnly(true)
                                                                        .build()
                                                        )).build(),
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
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
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
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Image")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.image)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Color")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.color)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(

                                                                FormField.builder()
                                                                        .id("richtext")
                                                                        .label("String/RichText")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.richText)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("name")
                                                                        .label("String/Markdown")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.markdown)
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
