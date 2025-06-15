package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/markdown")
public class MarkdownComponentPage implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Markdown")
                .content(List.of(
                        
                ))
                .build();
    }
}
