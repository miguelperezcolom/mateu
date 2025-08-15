package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Directory;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/directory")
public class DirectoryComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Directory")
                .content(List.of(
                        Directory.builder()
                                .menu(List.of(
                                        Menu.builder()
                                                .label("Invoices")
                                                .submenu(List.of(
                                                        RouteLink.builder()
                                                                .label("Page 1")
                                                                .build(),
                                                        RouteLink.builder()
                                                                .label("Page 2")
                                                                .build()
                                                ))
                                                .build(),
                                        Menu.builder()
                                                .label("Payments")
                                                .submenu(List.of(
                                                        RouteLink.builder()
                                                                .label("Page 1")
                                                                .build(),
                                                        RouteLink.builder()
                                                                .label("Page 2")
                                                                .build()
                                                ))
                                                .build()

                                ))
                                .build()
                ))
                .build();
    }
}
