package com.example.demo.infra.in.ui.fluent;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.TextComponent;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app")
public class FluentApp implements AppSupplier {

    @Override
    public App getApp(HttpRequest httpRequest) {
        return App.builder()
                .pageTitle("Fluent app")
                .title("Antonia")
                .subtitle("This is the subtitle bla, bla, bla")
                .variant(AppVariant.HAMBURGUER_MENU)
                .menu(List.of(
                        new RouteLink("/fluent-app/home", "Home", true),
                        new Menu("Layouts", List.of(
                                new RouteLink("/fluent-app/layouts/horizontal", "Horizontal Layout"),
                                new RouteLink("/fluent-app/layouts/vertical", "Vertical Layout"),
                                new RouteLink("/fluent-app/layouts/split", "Split Layout"),
                                new RouteLink("/fluent-app/layouts/tab", "Tab Layout"),
                                new RouteLink("/fluent-app/layouts/form", "Form Layout"),
                                new RouteLink("/fluent-app/layouts/accordion", "Accordion Layout"),
                                new RouteLink("/fluent-app/layouts/master-detail", "Master Detail Layout"),
                                new MenuSeparator(),
                                new RouteLink("/fluent-app/layouts/scroller", "Scroller"),
                                new RouteLink("/fluent-app/layouts/full-width", "Full Width"),
                                new RouteLink("/fluent-app/layouts/container", "Container")
                        )),
                        new Menu("Forms", List.of(
                                new RouteLink("/fluent-app/forms/basic", "Basic")
                        )),
                        new Menu("Crudls", List.of(
                                new RouteLink("/fluent-app/crudls/basic", "Basic")
                        )),
                        new Menu("Nested apps", List.of(
                                new RouteLink("/fluent-app/nested-apps/left", "Menu On Left"),
                                new RouteLink("/fluent-app/nested-apps/top", "Menu On Top"),
                                new RouteLink("/fluent-app/nested-apps/panels", "Menu Using Tabs")

                        )),
                        new Menu("Components", List.of(
                                new ContentLink("/fluent-app/content0", "Content 0", (rq) -> new TextComponent("Hola 0")),
                                new RouteLink("/fluent-app/components/", "Avatar"),
                                new RouteLink("/fluent-app/components/", "Badge"),
                                new RouteLink("/fluent-app/components/", "Board"),
                                new RouteLink("/fluent-app/components/", "Button"),
                                new RouteLink("/fluent-app/components/", "Card"),
                                new RouteLink("/fluent-app/components/", "Charts"),
                                new RouteLink("/fluent-app/components/", "Checkbox"),
                                new RouteLink("/fluent-app/components/", "Combo box"),
                                new RouteLink("/fluent-app/components/", "Confirm Dialog"),
                                new RouteLink("/fluent-app/components/", "Context Menu"),
                                new RouteLink("/fluent-app/components/", "Cookie Consent"),
                                new RouteLink("/fluent-app/components/", "Custom Field"),
                                new RouteLink("/fluent-app/components/", "Dashboard"),
                                new RouteLink("/fluent-app/components/", "Date picker"),
                                new RouteLink("/fluent-app/components/", "Date Time Picker"),
                                new RouteLink("/fluent-app/components/", "Details"),
                                new RouteLink("/fluent-app/components/", "Dialog"),
                                new RouteLink("/fluent-app/components/", "Email Field"),
                                new RouteLink("/fluent-app/components/", "Grid"),
                                new RouteLink("/fluent-app/components/", "Icons"),
                                new RouteLink("/fluent-app/components/", "Images"),
                                new RouteLink("/fluent-app/components/", "List Box"),
                                new RouteLink("/fluent-app/components/", "Map"),
                                new RouteLink("/fluent-app/components/", "Markdown"),
                                new RouteLink("/fluent-app/components/", "Menu Bar"),
                                new RouteLink("/fluent-app/components/", "Message Input"),
                                new RouteLink("/fluent-app/components/", "Message List"),
                                new RouteLink("/fluent-app/components/", "Micro service"),
                                new RouteLink("/fluent-app/components/", "Multi-select Combo Box"),
                                new RouteLink("/fluent-app/components/", "Notification"),
                                new RouteLink("/fluent-app/components/", "Number Field"),
                                new RouteLink("/fluent-app/components/", "Password Field"),
                                new RouteLink("/fluent-app/components/", "Popover"),
                                new RouteLink("/fluent-app/components/", "Progress bar"),
                                new RouteLink("/fluent-app/components/", "Radio Button"),
                                new RouteLink("/fluent-app/components/", "Rich Text Editor"),
                                new RouteLink("/fluent-app/components/", "Scroller"),
                                new RouteLink("/fluent-app/components/", "Select"),
                                new RouteLink("/fluent-app/components/", "Side Navigation"),
                                new RouteLink("/fluent-app/components/", "Tabs"),
                                new RouteLink("/fluent-app/components/", "Text Area"),
                                new RouteLink("/fluent-app/components/", "Text Field"),
                                new RouteLink("/fluent-app/components/", "Time Picker"),
                                new RouteLink("/fluent-app/components/", "Tooltip"),
                                new RouteLink("/fluent-app/components/", "Tree Grid"),
                                new RouteLink("/fluent-app/components/", "Upload"),
                                new RouteLink("/fluent-app/components/", "Virtual List")

                        ))
                ))

                .build();
    }
}
