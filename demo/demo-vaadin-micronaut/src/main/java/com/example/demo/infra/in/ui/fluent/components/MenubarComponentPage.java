package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContextMenu;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.fluent.MenuBar;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/menubar")
public class MenubarComponentPage implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Menu bar")
                .content(List.of(
                        MenuBar.builder()
                                .options(List.of(
                                        new RouteLink("/fluent-app/nested-apps/left/home", "Home"),
                                        new RouteLink("/fluent-app/nested-apps/left/page1", "Page 1"),
                                        (Actionable) new Menu("Submenu", List.of(
                                                new RouteLink("/fluent-app/nested-apps/left/home", "Home"),
                                                new RouteLink("/fluent-app/nested-apps/left/page1", "Page 1")
                                        ))
                                ))
                                .build()
                ))
                .build();
    }
}
