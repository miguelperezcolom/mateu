package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.MasterDetailLayout;
import io.mateu.uidl.data.SplitLayout;
import io.mateu.uidl.data.TextComponent;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/master-detail")
public class MasterDetailLayoutSample implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Split Layout")
                .content(List.of(MasterDetailLayout.builder()
                                .master(new TextComponent("Master"))
                                .detail(new TextComponent("Detail"))
                                .build()))
                .build();
    }
}
