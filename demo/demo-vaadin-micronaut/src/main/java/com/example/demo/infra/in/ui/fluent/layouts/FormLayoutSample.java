package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.TextComponent;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/form")
public class FormLayoutSample implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Form Layout")
                .content(List.of(FormLayout.builder()
                                .content(List.of(
                                        new TextComponent("Text 1"),
                                        new TextComponent("Text 2"),
                                        new TextComponent("Text 3")
                                ))
                        .build()))
                .build();
    }
}
