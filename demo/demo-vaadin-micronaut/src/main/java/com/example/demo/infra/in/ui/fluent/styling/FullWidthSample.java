package com.example.demo.infra.in.ui.fluent.styling;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FullWidth;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/styling/full-width")
public class FullWidthSample implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Full width")
                .content(List.of(new FullWidth(VerticalLayout.builder()
                        .content(List.of(
                                new Text("Top"),
                                new Text("Bottom")
                        ))
                        .build())))
                .build();
    }
}
