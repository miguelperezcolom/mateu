package com.example.demo.infra.in.ui.fluent.data;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/data/component-state-and-data")
public class ComponentStateAndDataPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Component state and data")
                .content(List.of(
                        Text.builder()
                                .text("${JSON.stringify(state)}")
                                .build(),
                        Text.builder()
                                .text("${JSON.stringify(data)}")
                                .build()
                ))
                .build();
    }
}
