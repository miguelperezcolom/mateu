package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/card")
public class CardComponentPage implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Card")
                .content(List.of(
                        
                ))
                .build();
    }
}
