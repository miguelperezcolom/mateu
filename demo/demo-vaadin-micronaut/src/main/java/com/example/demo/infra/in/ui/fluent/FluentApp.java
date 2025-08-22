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
                .style("width: 100%;")
                .menu(List.of(
                        new RouteLink("/fluent-app/home", "Home", true),
                        new Menu("Layouts", List.of(
                                new RouteLink("/fluent-app/layouts/horizontal", "Horizontal Layout"),
                                new RouteLink("/fluent-app/layouts/vertical", "Vertical Layout"),
                                new MenuSeparator(),
                                new RouteLink("/fluent-app/layouts/split", "Split Layout"),
                                new RouteLink("/fluent-app/layouts/tab", "Tab Layout"),
                                new RouteLink("/fluent-app/layouts/form", "Form Layout"),
                                new RouteLink("/fluent-app/layouts/accordion", "Accordion Layout"),
                                new RouteLink("/fluent-app/layouts/carousel", "Carousel Layout"),
                                new MenuSeparator(),
                                new RouteLink("/fluent-app/layouts/board", "Board Layout"),
                                new RouteLink("/fluent-app/layouts/master-detail", "Master Detail Layout")
                        )),
                        new Menu("Styling", List.of(
                                new RouteLink("/fluent-app/styling/full-width", "Full Width"),
                                new RouteLink("/fluent-app/styling/container", "Container")
                        )),
                        new Menu("Forms", List.of(
                                new RouteLink("/fluent-app/forms/basic", "Basic"),
                                new RouteLink("/fluent-app/components/button", "Button"),
                                new RouteLink("/fluent-app/forms/counter1", "Counter 1"),
                                new RouteLink("/fluent-app/forms/counter2", "Counter 2"),
                                new RouteLink("/fluent-app/forms/counter3", "Counter 3"),
                                new RouteLink("/fluent-app/forms/counter4", "Counter 4"),
                                new RouteLink("/fluent-app/forms/counter5", "Counter 5"),
                                new RouteLink("/fluent-app/forms/counter6", "Counter 6"),
                                new RouteLink("/fluent-app/forms/with-grid1", "With Grid 1"),
                                new RouteLink("/fluent-app/forms/with-grid2", "With Grid 2")
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
                                new RouteLink("/fluent-app/components/breadcrumbs", "Breadcrumbs"),
                                new RouteLink("/fluent-app/components/button", "Button"),
                                new RouteLink("/fluent-app/components/card", "Card"),
                                new RouteLink("/fluent-app/components/charts", "Charts"),
                                new RouteLink("/fluent-app/components/checkbox", "Checkbox"),
                                new RouteLink("/fluent-app/components/choice", "Choice"),
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
                                new RouteLink("/fluent-app/components/directory", "Directory"),
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
                                new RouteLink("/fluent-app/components/text", "Text"),
                                new RouteLink("/fluent-app/components/text-area", "Text Area"),
                                new RouteLink("/fluent-app/components/text-field", "Text Field"),
                                new RouteLink("/fluent-app/components/time-picker", "Time Picker"),
                                new RouteLink("/fluent-app/components/tooltip", "Tooltip"),
                                new RouteLink("/fluent-app/components/train", "Train"),
                                new RouteLink("/fluent-app/components/tree-grid", "Tree Grid"),
                                new RouteLink("/fluent-app/components/upload", "Upload"),
                                new RouteLink("/fluent-app/components/virtual-list", "Virtual List")
                        )),
                        new Menu("Actions", List.of(
                                new RouteLink("/fluent-app/actions/foreground", "Run in foreground"),
                                new RouteLink("/fluent-app/actions/background", "Run in background"),
                                new RouteLink("/fluent-app/actions/confirmation-required", "Confirmation required"),
                                new RouteLink("/fluent-app/actions/validation-required", "Validation required"),
                                new RouteLink("/fluent-app/actions/server-side-events", "Server Sent Events (SSE)"),
                                new RouteLink("/fluent-app/actions/row-selected-required", "Row selected required"),
                                new RouteLink("/fluent-app/actions/custom-event", "Client side event"),
                                new RouteLink("/fluent-app/actions/href", "Href"),
                                new RouteLink("/fluent-app/actions/js", "Js")
                        )),
                        new Menu("Triggers", List.of(
                                new RouteLink("/fluent-app/triggers/on-load", "On Load"),
                                new RouteLink("/fluent-app/triggers/on-success", "On Success"),
                                new RouteLink("/fluent-app/triggers/on-error", "On Error"),
                                new RouteLink("/fluent-app/triggers/on-custom-event", "On Custom Event"),
                                new RouteLink("/fluent-app/triggers/on-value-change", "On Value Change")
                        )),
                        new Menu("Client-Side Logic (Rules)", List.of(
                                new RouteLink("/fluent-app/rules/visibility", "Visibility"),
                                new RouteLink("/fluent-app/rules/enabled", "Enabled"),
                                new RouteLink("/fluent-app/rules/run-action", "Run Action"),
                                new RouteLink("/fluent-app/rules/run-js", "Run JS"),
                                new RouteLink("/fluent-app/rules/set-attribute-value", "Set attribute value"),
                                new RouteLink("/fluent-app/rules/set-metadata-value", "Set metadata value"),
                                new RouteLink("/fluent-app/rules/set-data-value", "Set data value"),
                                new RouteLink("/fluent-app/rules/set-css-classes", "Set css classes"),
                                new RouteLink("/fluent-app/rules/set-style", "Set style")
                        )),
                        new Menu("Validations", List.of(
                                new RouteLink("/fluent-app/validations/required", "Required"),
                                new RouteLink("/fluent-app/validations/min-and-max", "Min and Max"),
                                new RouteLink("/fluent-app/validations/pattern", "Pattern"),
                                new RouteLink("/fluent-app/validations/conditional", "Conditional"),
                                new RouteLink("/fluent-app/validations/form-wise", "Form wise"),
                                new RouteLink("/fluent-app/validations/server-side", "Server side")
                        )),
                        new Menu("Data", List.of(
                                new RouteLink("/fluent-app/data/app-state", "App state"),
                                new RouteLink("/fluent-app/data/app-data", "App data"),
                                new RouteLink("/fluent-app/data/component-state", "Component state"),
                                new RouteLink("/fluent-app/data/component-data", "Component data")
                        )),
                        new Menu("Routes", List.of(
                                new RouteLink("/fluent-app/routes/404", "404"),
                                new RouteLink("/fluent-app/routes/custom-route-resolver", "Custom route resolver")
                        ))
                ))
                .build();
    }

    @Override
    public String style() {
        return "width: 100%;";
    }
}
