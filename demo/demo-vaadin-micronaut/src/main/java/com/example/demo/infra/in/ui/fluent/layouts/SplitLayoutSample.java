package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.SplitLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/split")
public class SplitLayoutSample implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Split Layout")
                .content(List.of(SplitLayout.builder()
                                .master(new Text("Master"))
                                .detail(new Text("Detail"))
                                .build()))
                .build();
    }
}
