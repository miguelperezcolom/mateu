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

@Route(value="/rules/visibility-from-backend", parentRoute="^$")
public class HideFromBackendPage implements ComponentTreeSupplier {

    boolean hidden = false;

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Visibility from backend")
                .content(List.of(
                        Text.builder()
                                .id("texto")
                                .text("Now you see me")
                                .build(),
                        new Button("Toggle", () ->
                                new Data(
                                        Map.of("texto.hidden", hidden = !hidden),
                                        this))
                ))
                .build();
    }
}
