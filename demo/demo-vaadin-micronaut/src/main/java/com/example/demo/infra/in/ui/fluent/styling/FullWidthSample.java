package com.example.demo.infra.in.ui.fluent.styling;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FullWidth;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/styling/full-width")
public class FullWidthSample implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
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
