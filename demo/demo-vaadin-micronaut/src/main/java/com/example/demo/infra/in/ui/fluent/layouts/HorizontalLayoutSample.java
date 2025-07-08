package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/horizontal")
public class HorizontalLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Horizontal Layout")
                .content(List.of(HorizontalLayout.builder()
                                .content(List.of(
                                        Text.builder()
                                                .text("Left")
                                                .style("background-color: red;")
                                                .build(),
                                        Text.builder()
                                                .text("Right")
                                                .style("background-color: green;")
                                                .build()
                                ))
                        .build()))
                .build();
    }
}
