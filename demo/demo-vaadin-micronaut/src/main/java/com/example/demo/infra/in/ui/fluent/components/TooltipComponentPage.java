package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.Tooltip;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/tooltip")
public class TooltipComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Tooltip")
                .content(List.of(
                        Tooltip.builder()
                                .text("Hola tooltip")
                                .wrapped(new Text("Hola!"))
                                .build()
                ))
                .build();
    }
}
