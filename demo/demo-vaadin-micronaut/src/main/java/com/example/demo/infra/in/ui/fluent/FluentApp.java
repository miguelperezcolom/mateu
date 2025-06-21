package com.example.demo.infra.in.ui.fluent;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
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
                                new RouteLink("/fluent-app/layouts/board", "Board Layout"),
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
                                new RouteLink("/fluent-app/nested-apps/tabs", "Menu Using Tabs")

                        )),
                        new Menu("Components", List.of(
                                new ContentLink("/fluent-app/content0", "Content 0", (rq) -> new Text("Hola 0")),
                                new RouteLink("/fluent-app/components/anchor", "Anchor"),
                                new RouteLink("/fluent-app/components/avatar", "Avatar"),
                                new RouteLink("/fluent-app/components/badge", "Badge"),
                                new RouteLink("/fluent-app/components/button", "Button"),
                                new RouteLink("/fluent-app/components/card", "Card"),
                                new RouteLink("/fluent-app/components/charts", "Charts"),
                                new RouteLink("/fluent-app/components/checkbox", "Checkbox"),
                                new RouteLink("/fluent-app/components/combobox", "Combo box"),
                                new RouteLink("/fluent-app/components/confirm-dialog", "Confirm Dialog"),
                                new RouteLink("/fluent-app/components/context-menu", "Context Menu"),
                                new RouteLink("/fluent-app/components/cookie-consent", "Cookie Consent"),
                                new RouteLink("/fluent-app/components/custom-field", "Custom Field"),
                                new RouteLink("/fluent-app/components/dashboard", "Dashboard"),
                                new RouteLink("/fluent-app/components/date-picker", "Date picker"),
                                new RouteLink("/fluent-app/components/date-time-picker", "Date Time Picker"),
                                new RouteLink("/fluent-app/components/details", "Details"),
                                new RouteLink("/fluent-app/components/dialog", "Dialog"),
                                new RouteLink("/fluent-app/components/element", "Element"),
                                new RouteLink("/fluent-app/components/email-field", "Email Field"),
                                new RouteLink("/fluent-app/components/grid", "Grid"),
                                new RouteLink("/fluent-app/components/icon", "Icons"),
                                new RouteLink("/fluent-app/components/image", "Images"),
                                new RouteLink("/fluent-app/components/list-box", "List Box"),
                                new RouteLink("/fluent-app/components/map", "Map"),
                                new RouteLink("/fluent-app/components/markdown", "Markdown"),
                                new RouteLink("/fluent-app/components/menubar", "Menu Bar"),
                                new RouteLink("/fluent-app/components/message-input", "Message Input"),
                                new RouteLink("/fluent-app/components/message-list", "Message List"),
                                new RouteLink("/fluent-app/components/micro-frontend", "Micro frontend"),
                                new RouteLink("/fluent-app/components/multi-select-combo-box", "Multi-select Combo Box"),
                                new RouteLink("/fluent-app/components/notification", "Notification"),
                                new RouteLink("/fluent-app/components/number-field", "Number Field"),
                                new RouteLink("/fluent-app/components/password-field", "Password Field"),
                                new RouteLink("/fluent-app/components/popover", "Popover"),
                                new RouteLink("/fluent-app/components/progress-bar", "Progress bar"),
                                new RouteLink("/fluent-app/components/radio-button", "Radio Button"),
                                new RouteLink("/fluent-app/components/rich-text-editor", "Rich Text Editor"),
                                new RouteLink("/fluent-app/components/scroller", "Scroller"),
                                new RouteLink("/fluent-app/components/select", "Select"),
                                new RouteLink("/fluent-app/components/side-navigation", "Side Navigation"),
                                new RouteLink("/fluent-app/components/tabs", "Tabs"),
                                new RouteLink("/fluent-app/components/text", "Text"),
                                new RouteLink("/fluent-app/components/text-area", "Text Area"),
                                new RouteLink("/fluent-app/components/text-field", "Text Field"),
                                new RouteLink("/fluent-app/components/time-picker", "Time Picker"),
                                new RouteLink("/fluent-app/components/tooltip", "Tooltip"),
                                new RouteLink("/fluent-app/components/tree-grid", "Tree Grid"),
                                new RouteLink("/fluent-app/components/upload", "Upload"),
                                new RouteLink("/fluent-app/components/virtual-list", "Virtual List")
                        ))
                ))

                .build();
    }
}
