package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Container;
import io.mateu.uidl.data.FullWidth;
import io.mateu.uidl.data.TextComponent;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/container")
public class ContainerSample implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Container")
                .content(List.of(new Container(VerticalLayout.builder()
                        .content(List.of(
                                new TextComponent("Top"),
                                new TextComponent("Bottom")
                        ))
                        .build())))
                .build();
    }
}
