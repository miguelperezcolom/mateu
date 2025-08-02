package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.HorizontalLayoutJustification;
import io.mateu.uidl.data.SpacingVariant;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalAlignment;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

import static com.example.demo.infra.in.ui.fluent.layouts.LayoutSampleHelper.buildPanel;

@Route("/fluent-app/layouts/horizontal")
public class HorizontalLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Horizontal Layout")
                .content(List.of(

                        new Text("normal"),

                        HorizontalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .build(),

                        new Text("padding"),

                        HorizontalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .padding(true)
                                .build(),

                        new Text("spacing"),

                        HorizontalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .spacing(true)
                                .build(),


                        new Text("full width"),

                        HorizontalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel("width: 100%;")
                                ))
                                .fullWidth(true)
                                .build(),

                        new Text("justify end"),

                        HorizontalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .justification(HorizontalLayoutJustification.END)
                                .fullWidth(true)
                                .build(),

                        new Text("grows"),

                        HorizontalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .flexGrows(List.of(1, 0))
                                .fullWidth(true)
                                .build(),

                        new Text("spacing variant"),

                        HorizontalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .spacingVariant(SpacingVariant.xl)
                                .build(),

                        new Text("wrap"),

                        HorizontalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .wrap(true)
                                .build(),

                        new Text("vertical alignment"),

                        HorizontalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel("min-height: 10rem;")
                                ))
                                .verticalAlignment(VerticalAlignment.END)
                                .build(),

                        new Text("")

                        ))
                .build();
    }

}
