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
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Details")
                .content(List.of(
                        Details.builder()
                                .summary(new Text("Invoices"))
                                .content(VerticalLayout.builder()
                                        .content(List.of(
                                                new Anchor("Pending", ""),
                                                new Anchor("Sent", ""),
                                                new Anchor("Received", "")
                                        ))
                                        .padding(true)
                                        .build())
                                .opened(false)
                                .build()
                ))
                .build();
    }
}
