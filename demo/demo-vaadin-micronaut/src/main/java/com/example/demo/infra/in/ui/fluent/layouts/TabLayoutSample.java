package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/tab")
public class TabLayoutSample implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Tab Layout")
                .content(List.of(TabLayout.builder()
                                .tabs(List.of(
                                        new Tab("Tab 1", new Text("Tab 1")),
                                        new Tab("Tab 2", new Text("Tab 2")),
                                        new Tab("Tab 3", new Text("Tab 3"))
                                ))
                        .build()))
                .build();
    }
}
