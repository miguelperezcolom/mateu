package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.Details;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/details")
public class DetailsComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Details")
                .content(List.of(
                        Details.builder()
                                .summary(new Text("Invoices"))
                                .content(VerticalLayout.builder()
                                        .content(List.of(
                                                new Text("There are 1000 pending invoices."),
                                                new Text("For a total of 34.213,01 Euros"),
                                                new Anchor("Go wherever", "")
                                        ))
                                        .spacing(true)
                                        .build())
                                .opened(false)
                                .build()
                ))
                .build();
    }
}
