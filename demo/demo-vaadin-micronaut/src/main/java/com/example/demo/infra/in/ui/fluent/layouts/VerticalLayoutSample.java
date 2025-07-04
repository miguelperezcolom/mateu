package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/vertical")
public class VerticalLayoutSample implements ComponentTreeSupplier {

    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Vertical Layout")
                .content(List.of(VerticalLayout.builder()
                                .content(List.of(
                                        new Text("Top"),
                                        new Text("Bottom")
                                ))
                        .build()))
                .build();
    }
}
