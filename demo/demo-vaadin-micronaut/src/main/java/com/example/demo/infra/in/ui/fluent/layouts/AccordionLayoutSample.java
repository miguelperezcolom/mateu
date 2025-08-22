package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.data.AccordionLayoutVariant;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/accordion")
public class AccordionLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Accordion Layout")
                .content(List.of(

                        new Text("basic"),

                        AccordionLayout.builder()
                                .panels(List.of(
                                        new AccordionPanel("Panel 1", new Text("Panel 1")),
                                        new AccordionPanel("Panel 2", new Text("Panel 2")),
                                        new AccordionPanel("Panel 3", new Text("Panel 3"))
                                ))
                        .build(),


                        new Text("active"),

                        AccordionLayout.builder()
                                .panels(List.of(
                                        new AccordionPanel("Panel 1", new Text("Panel 1")),
                                        AccordionPanel.builder()
                                                .label("Panel 2")
                                                .content(new Text("Panel 2"))
                                                .active(true)
                                                .build(),
                                        new AccordionPanel("Panel 3", new Text("Panel 3"))
                                ))
                                .build(),


                        new Text("reverse"),

                        AccordionLayout.builder()
                                .panels(List.of(
                                        new AccordionPanel("Panel 1", new Text("Panel 1")),
                                        new AccordionPanel("Panel 2", new Text("Panel 2")),
                                        new AccordionPanel("Panel 3", new Text("Panel 3"))
                                ))
                                .variant(AccordionLayoutVariant.reverse)
                                .build(),

                        new Text("filled"),

                        AccordionLayout.builder()
                                .panels(List.of(
                                        new AccordionPanel("Panel 1", new Text("Panel 1")),
                                        new AccordionPanel("Panel 2", new Text("Panel 2")),
                                        new AccordionPanel("Panel 3", new Text("Panel 3"))
                                ))
                                .variant(AccordionLayoutVariant.filled)
                                .build(),

                        new Text("small"),

                        AccordionLayout.builder()
                                .panels(List.of(
                                        new AccordionPanel("Panel 1", new Text("Panel 1")),
                                        new AccordionPanel("Panel 2", new Text("Panel 2")),
                                        new AccordionPanel("Panel 3", new Text("Panel 3"))
                                ))
                                .variant(AccordionLayoutVariant.small)
                                .build(),

                        new Text("small"),

                        AccordionLayout.builder()
                                .panels(List.of(
                                        new AccordionPanel("Panel 1", new Text("Panel 1")),
                                        new AccordionPanel("Panel 2", new Text("Panel 2")),
                                        AccordionPanel.builder()
                                                .label("Panel 3")
                                                .disabled(true)
                                                .content(new Text("Panel 3"))
                                                .build()
                                ))
                                .variant(AccordionLayoutVariant.small)
                                .build(),

                        new Text("")
                        ))
                .build();
    }
}
