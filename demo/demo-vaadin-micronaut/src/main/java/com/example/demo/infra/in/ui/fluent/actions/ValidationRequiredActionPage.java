package com.example.demo.infra.in.ui.fluent.actions;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/actions/validation-required")
public class ValidationRequiredActionPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Validation required")
                .content(List.of(
                ))
                .build();
    }
}
