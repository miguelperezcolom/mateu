package com.example.demo.infra.in.ui.fluent.rules;

import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

public class SetMetadataValueRulePage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Set metadata value rule (TBD)")
                .content(List.of(
                ))
                .build();
    }
}
