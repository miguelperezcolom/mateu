package com.example.demo.infra.in.ui.fluent.rules;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;
import java.util.Map;

@Route("/fluent-app/rules/visibility")
public class VisibilityRulePage implements ComponentTreeSupplier {

    boolean visible = true;

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Visibility rule")
                .content(List.of(
                        Text.builder()
                                .id("texto")
                                .text("Now you see me")
                                .build(),
                        new Button("Toggle", () ->
                                new Data(
                                        Map.of("texto.visible", visible = !visible),
                                        this))
                ))
                .build();
    }
}
