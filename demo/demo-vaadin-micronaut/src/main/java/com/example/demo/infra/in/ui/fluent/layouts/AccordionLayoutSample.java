package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.TextComponent;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/accordion")
public class AccordionLayoutSample implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Accordion Layout")
                .content(List.of(AccordionLayout.builder()
                                .panels(List.of(
                                        new AccordionPanel("Panel 1", new TextComponent("Panel 1")),
                                        new AccordionPanel("Panel 2", new TextComponent("Panel 2")),
                                        new AccordionPanel("Panel 3", new TextComponent("Panel 3"))
                                ))
                        .build()))
                .build();
    }
}
