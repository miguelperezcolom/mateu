package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/horizontal")
public class HorizontalLayoutSample implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Horizontal Layout")
                .content(List.of(HorizontalLayout.builder()
                                .content(List.of(
                                        new Text("Left"),
                                        new Text("Right")
                                ))
                        .build()))
                .build();
    }
}
