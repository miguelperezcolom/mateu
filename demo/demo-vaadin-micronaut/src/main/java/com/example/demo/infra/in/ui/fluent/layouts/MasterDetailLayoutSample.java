package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.MasterDetailLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/master-detail")
public class MasterDetailLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Split Layout")
                .content(List.of(MasterDetailLayout.builder()
                                .master(new Text("Master"))
                                .detail(new Text("Detail"))
                                .build()))
                .build();
    }
}
