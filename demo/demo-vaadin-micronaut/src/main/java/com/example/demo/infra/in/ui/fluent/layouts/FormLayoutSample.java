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

@Route("/layouts/form")
public class FormLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Form Layout")
                .content(List.of(

                        new Text("max columns = 2"),

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
                                .maxColumns(2)
                        .build(),

                        new Text("max columns = 2, autoresponsive"),

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

                        new Text("using fields, autoresponsive"),

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
                                                                .dataType(FieldDataType.string)
                                                                .label("Address (colspan = 2)")
                                                                .colspan(2)
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.bool)
                                                                .label("Registered")
                                                                .build()
                                                ))
                                                .build(),
                                        FormRow.builder()
                                                .content(List.of(
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .label("Description (colspan = 2, alone in a row, width=100%)")
                                                                .colspan(2)
                                                                .style("width: 100%;")
                                                                .build()
                                                ))
                                                .build()
                                ))
                                .autoResponsive(true)
                                .build(),


                        new Text("labels aside, autoresponsive, max columns = 2"),

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
