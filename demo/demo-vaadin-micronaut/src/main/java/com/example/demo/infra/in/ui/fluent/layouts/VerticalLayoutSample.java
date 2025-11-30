package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.HorizontalAlignment;
import io.mateu.uidl.data.HorizontalLayoutJustification;
import io.mateu.uidl.data.SpacingVariant;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

import static com.example.demo.infra.in.ui.fluent.layouts.LayoutSampleHelper.buildPanel;

@Route(value="/layouts/vertical", parentRoute="^$")
public class VerticalLayoutSample implements ComponentTreeSupplier {

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Vertical Layout")
                .content(List.of(

                        new Text("basic"),

                        VerticalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .build(),

                        new Text("padding"),

                        VerticalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .padding(true)
                                .build(),

                        new Text("spacing"),

                        VerticalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .spacing(true)
                                .build(),


                        new Text("full width"),

                        VerticalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel("width: 100%;")
                                ))
                                .fullWidth(true)
                                .build(),

                        new Text("justify end"),

                        VerticalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .justification(HorizontalLayoutJustification.END)
                                .style("min-height: 10rem;")
                                .build(),

                        new Text("grows"),

                        VerticalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .flexGrows(List.of(1, 0))
                                .style("min-height: 10rem;")
                                .build(),

                        new Text("spacing variant"),

                        VerticalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .spacingVariant(SpacingVariant.xl)
                                .build(),

                        new Text("wrap"),

                        VerticalLayout.builder()
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
                                .style("max-height: 20rem;")
                                .build(),

                        new Text("horizontal alignment"),

                        VerticalLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel("min-width: 10rem;")
                                ))
                                .horizontalAlignment(HorizontalAlignment.END)
                                .build(),

                        new Text("")

                        ))
                .build();
    }

}
