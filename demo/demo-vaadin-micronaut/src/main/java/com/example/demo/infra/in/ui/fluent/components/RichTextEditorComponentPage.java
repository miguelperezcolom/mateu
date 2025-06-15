package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/rich-text-editor")
public class RichTextEditorComponentPage implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Rich text editor")
                .content(List.of(
                        
                ))
                .build();
    }
}
