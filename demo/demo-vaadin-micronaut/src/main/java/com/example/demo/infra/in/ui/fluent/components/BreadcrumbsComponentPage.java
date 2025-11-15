package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.data.Breadcrumbs;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/components/breadcrumbs")
public class BreadcrumbsComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Breadcrumbs")
                .content(List.of(
                    Breadcrumbs.builder()
                            .breadcrumbs(List.of(
                                    new Breadcrumb("Breadcrumb 1", ""),
                                    new Breadcrumb("Breadcrumb 2", "")
                            ))
                            .currentItemText("Current item")
                            .build()
                ))
                .build();
    }
}
