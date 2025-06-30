package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/accordion")
public class AccordionLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Accordion Layout")
                .content(List.of(AccordionLayout.builder()
                                .panels(List.of(
                                        new AccordionPanel("Panel 1", new Text("Panel 1")),
                                        new AccordionPanel("Panel 2", new Text("Panel 2")),
                                        new AccordionPanel("Panel 3", new Text("Panel 3"))
                                ))
                        .build()))
                .build();
    }
}
