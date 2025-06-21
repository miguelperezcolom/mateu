package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Scroller;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/scroller")
public class ScrollerSample implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Scroller")
                .content(List.of(new Scroller(VerticalLayout.builder()
                        .content(List.of(
                                new Text("Top"),
                                new Text("Bottom")
                        ))
                        .build())))
                .build();
    }
}
