package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

import static com.example.demo.infra.in.ui.fluent.layouts.LayoutSampleHelper.buildPanel;

@Route("/fluent-app/layouts/form")
public class FormLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Form Layout")
                .content(List.of(

                        new Text("basic"),

                        FormLayout.builder()
                                .content(List.of(
                                        FormRow.builder()
                                                .content(List.of(
                                                        buildPanel(),
                                                        buildPanel(),
                                                        buildPanel()
                                                ))
                                                .build()
                                ))
                                .autoResponsive(true)
                                .maxColumns(2)
                        .build(),

                        new Text("using fields"),

                        FormLayout.builder()
                                .content(List.of(
                                        FormRow.builder()
                                                .content(List.of(
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .label("Name")
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.integer)
                                                                .label("Age")
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.bool)
                                                                .label("Registered")
                                                                .build()
                                                ))
                                                .build()
                                ))
                                .autoResponsive(true)
                                .maxColumns(2)
                                .build(),


                        new Text("labels aside"),

                        FormLayout.builder()
                                .content(List.of(
                                        FormRow.builder()
                                                .content(List.of(
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .label("Name")
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.integer)
                                                                .label("Age")
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.bool)
                                                                .label("Registered")
                                                                .build()
                                                ))
                                                .build()
                                ))
                                .autoResponsive(true)
                                .labelsAside(true)
                                .maxColumns(2)
                                .build(),


                        new Text("")

                ))
                .style("width: 100%;")
                .cssClasses("test")
                .build();
    }
}
