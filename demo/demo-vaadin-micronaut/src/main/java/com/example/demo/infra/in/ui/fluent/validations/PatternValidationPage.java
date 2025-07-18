package com.example.demo.infra.in.ui.fluent.validations;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/validations/pattern")
public class PatternValidationPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Pattern validation")
                .content(List.of(
                ))
                .build();
    }
}
