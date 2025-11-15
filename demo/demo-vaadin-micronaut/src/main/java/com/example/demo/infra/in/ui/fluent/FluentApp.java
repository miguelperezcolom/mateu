package com.example.demo.infra.in.ui.fluent;

import io.mateu.uidl.annotations.MateuUI;
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

@MateuUI("/fluent")
public class FluentApp implements AppSupplier {

    @Override
    public App getApp(HttpRequest httpRequest) {
        return App.builder()
                .pageTitle("Fluent app")
                .title("Antonia")
                .subtitle("This is the subtitle bla, bla, bla")
                .variant(AppVariant.HAMBURGUER_MENU)
                .drawerClosed(true)
                .style("width: 100%;")
                //.cssClasses("redwood")
                .menu(List.of(
                        new RouteLink("/home", "Home", true),
                        new Menu("Layouts", List.of(
                                new RouteLink("/layouts/horizontal", "Horizontal Layout"),
                                new RouteLink("/layouts/vertical", "Vertical Layout"),
                                new MenuSeparator(),
                                new RouteLink("/layouts/split", "Split Layout"),
                                new RouteLink("/layouts/tab", "Tab Layout"),
                                new RouteLink("/layouts/form", "Form Layout"),
                                new RouteLink("/layouts/accordion", "Accordion Layout"),
                                new RouteLink("/layouts/carousel", "Carousel Layout"),
                                new MenuSeparator(),
                                new RouteLink("/layouts/board", "Board Layout"),
                                new RouteLink("/layouts/master-detail", "Master Detail Layout")
                        )),
                        new Menu("Styling", List.of(
                                new RouteLink("/styling/full-width", "Full Width"),
                                new RouteLink("/styling/container", "Container")
                        )),
                        new Menu("Components", List.of(
                                new Menu("High level", List.of(
                                        new Menu("Forms", List.of(
                                                new RouteLink("/forms/basic", "Basic"),
                                                new RouteLink("/forms/counter1", "Counter 1"),
                                                new RouteLink("/forms/counter2", "Counter 2"),
                                                new RouteLink("/forms/counter3", "Counter 3"),
                                                new RouteLink("/forms/counter4", "Counter 4"),
                                                new RouteLink("/forms/counter5", "Counter 5"),
                                                new RouteLink("/forms/counter6", "Counter 6"),
                                                new RouteLink("/forms/with-grid1", "With Grid 1"),
                                                new RouteLink("/forms/with-grid2", "With Grid 2"),
                                                new RouteLink("/forms/string-fields", "String fields"),
                                                new RouteLink("/forms/boolean-fields", "Boolean fields"),
                                                new RouteLink("/forms/numeric-fields", "Numeric fields"),
                                                new RouteLink("/forms/collection-fields", "Collection fields"),
                                                new RouteLink("/forms/grid-fields", "Grid fields"),
                                                new RouteLink("/forms/editable-grid-fields", "Editable grid fields"),
                                                new RouteLink("/forms/data-sourced-fields-1", "Data sourced fields 1"),
                                                new RouteLink("/forms/data-sourced-fields-2", "Data sourced fields 2"),
                                                new RouteLink("/forms/date-fields", "Date fields"),
                                                new RouteLink("/forms/file-fields", "File fields"),
                                                new RouteLink("/forms/other-fields", "Other fields"),
                                                new RouteLink("/forms/choice-fields", "Choice field"),
                                                new RouteLink("/forms/choice-with-images-fields", "Choice with images field"),
                                                new RouteLink("/forms/combobox-default-value", "Combobox default value")
                                        )),
                                        new Menu("Crudls", List.of(
                                                new RouteLink("/crudls/basic", "Basic"),
                                                new RouteLink("/crudls/more-columns", "More columns"),
                                                new RouteLink("/crudls/with-row-menu", "With row menu"),
                                                new RouteLink("/crudls/styled", "Styled")
                                        )),
                                        new Menu("Nested apps", List.of(
                                                new RouteLink("/nested-apps/left", "Menu On Left"),
                                                new RouteLink("/nested-apps/top", "Menu On Top"),
                                                new RouteLink("/nested-apps/tabs", "Menu Using Tabs")
                                        ))
                                )),
                                new Menu("Building blocks", List.of(
                                        new ContentLink("/content0", "Content 0", (rq) -> new Text("Hola 0")),
                                        new RouteLink("/components/anchor", "Anchor"),
                                        new RouteLink("/components/avatar", "Avatar"),
                                        new RouteLink("/components/badge", "Badge"),
                                        new RouteLink("/components/breadcrumbs", "Breadcrumbs"),
                                        new RouteLink("/components/button", "Button"),
                                        new RouteLink("/components/card", "Card"),
                                        new RouteLink("/components/charts", "Charts"),
                                        new RouteLink("/components/checkbox", "Checkbox"),
                                        new RouteLink("/components/choice", "Choice"),
                                        new RouteLink("/components/combobox", "Combo box"),
                                        new RouteLink("/components/confirm-dialog", "Confirm Dialog"),
                                        new RouteLink("/components/context-menu", "Context Menu"),
                                        new RouteLink("/components/cookie-consent", "Cookie Consent"),
                                        new RouteLink("/components/custom-field", "Custom Field"),
                                        new RouteLink("/components/dashboard", "Dashboard"),
                                        new RouteLink("/components/date-picker", "Date picker"),
                                        new RouteLink("/components/date-time-picker", "Date Time Picker"),
                                        new RouteLink("/components/details", "Details"),
                                        new RouteLink("/components/dialog", "Dialog"),
                                        new RouteLink("/components/directory", "Directory"),
                                        new RouteLink("/components/element", "Element"),
                                        new RouteLink("/components/email-field", "Email Field"),
                                        new RouteLink("/components/grid", "Grid"),
                                        new RouteLink("/components/icon", "Icons"),
                                        new RouteLink("/components/image", "Images"),
                                        new RouteLink("/components/list-box", "List Box"),
                                        new RouteLink("/components/map", "Map"),
                                        new RouteLink("/components/markdown", "Markdown"),
                                        new RouteLink("/components/menubar", "Menu Bar"),
                                        new RouteLink("/components/message-input", "Message Input"),
                                        new RouteLink("/components/message-list", "Message List"),
                                        new RouteLink("/components/micro-frontend", "Micro frontend"),
                                        new RouteLink("/components/multi-select-combo-box", "Multi-select Combo Box"),
                                        new RouteLink("/components/notification", "Notification"),
                                        new RouteLink("/components/number-field", "Number Field"),
                                        new RouteLink("/components/password-field", "Password Field"),
                                        new RouteLink("/components/popover", "Popover"),
                                        new RouteLink("/components/progress-bar", "Progress bar"),
                                        new RouteLink("/components/radio-button", "Radio Button"),
                                        new RouteLink("/components/rich-text-editor", "Rich Text Editor"),
                                        new RouteLink("/components/scroller", "Scroller"),
                                        new RouteLink("/components/select", "Select"),
                                        new RouteLink("/components/side-navigation", "Side Navigation"),
                                        new RouteLink("/components/text", "Text"),
                                        new RouteLink("/components/text-area", "Text Area"),
                                        new RouteLink("/components/text-field", "Text Field"),
                                        new RouteLink("/components/time-picker", "Time Picker"),
                                        new RouteLink("/components/tooltip", "Tooltip"),
                                        new RouteLink("/components/train", "Train"),
                                        new RouteLink("/components/tree-grid", "Tree Grid"),
                                        new RouteLink("/components/upload", "Upload"),
                                        new RouteLink("/components/virtual-list", "Virtual List"),
                                        new RouteLink("/components/web-component", "Web component")
                                ))
                        )),
                        new Menu("Logic", List.of(
                                new Menu("Actions", List.of(
                                        new RouteLink("/actions/foreground", "Run in foreground"),
                                        new RouteLink("/actions/background", "Run in background"),
                                        new RouteLink("/actions/confirmation-required", "Confirmation required"),
                                        new RouteLink("/actions/validation-required", "Validation required"),
                                        new RouteLink("/actions/server-side-events", "Server Sent Events (SSE)"),
                                        new RouteLink("/actions/row-selected-required", "Row selected required"),
                                        new RouteLink("/actions/custom-event", "Client side event"),
                                        new RouteLink("/actions/href", "Href"),
                                        new RouteLink("/actions/js", "Js")
                                )),
                                new Menu("Triggers", List.of(
                                        new RouteLink("/triggers/on-load", "On Load"),
                                        new RouteLink("/triggers/on-success", "On Success"),
                                        new RouteLink("/triggers/on-error", "On Error"),
                                        new RouteLink("/triggers/on-custom-event", "On Custom Event"),
                                        new RouteLink("/triggers/on-value-change", "On Value Change")
                                )),
                                new Menu("Client-Side Logic (Rules)", List.of(
                                        new RouteLink("/rules/visibility-from-backend", "Visibility from backend"),
                                        new RouteLink("/rules/enabled-from-backend", "Enabled from backend"),
                                        new RouteLink("/rules/visibility", "Visibility"),
                                        new RouteLink("/rules/enabled", "Enabled"),
                                        new RouteLink("/rules/run-action", "Run Action"),
                                        new RouteLink("/rules/run-js", "Run JS"),
                                        new RouteLink("/rules/set-attribute-value", "Set attribute value"),
                                        new RouteLink("/rules/set-metadata-value", "Set metadata value"),
                                        new RouteLink("/rules/set-data-value", "Set data value"),
                                        new RouteLink("/rules/set-css-classes", "Set css classes"),
                                        new RouteLink("/rules/set-style", "Set style")
                                )),
                                new Menu("Validations", List.of(
                                        new RouteLink("/validations/required", "Required"),
                                        new RouteLink("/validations/min-and-max", "Min and Max"),
                                        new RouteLink("/validations/min-and-max-length", "Min and Max length"),
                                        new RouteLink("/validations/pattern", "Pattern"),
                                        new RouteLink("/validations/conditional", "Conditional"),
                                        new RouteLink("/validations/form-wise", "Form wise"),
                                        new RouteLink("/validations/server-side", "Server side")
                                )),
                                new Menu("Commands and messages", List.of(
                                        new RouteLink("/commands-and-messages/run-action", "Run action"),
                                        new RouteLink("/commands-and-messages/close-dialog", "Close dialog"),
                                        new RouteLink("/commands-and-messages/set-favicon", "Set favicon"),
                                        new RouteLink("/commands-and-messages/set-window-title", "Set window title"),
                                        new RouteLink("/commands-and-messages/message", "Message")
                                ))
                        )),
                        new Menu("Patterns", List.of(
                                new RouteLink("/patterns/async", "Async"),
                                new RouteLink("/patterns/master-detail", "Master-detail"),
                                new RouteLink("/patterns/progressive", "Progressive UI"),
                                new RouteLink("/patterns/micro-frontend", "Micro frontends")
                        )),
                        new Menu("Data", List.of(
                                new RouteLink("/data/app-state", "App state"),
                                new RouteLink("/data/app-data", "App data"),
                                new RouteLink("/data/component-state", "Component state"),
                                new RouteLink("/data/component-data", "Component data"),
                                new RouteLink("/data/component-state-and-data", "Component state and data")
                        )),
                        new Menu("Routes", List.of(
                                new RouteLink("/routes/404", "404"),
                                new RouteLink("/routes/custom-route-resolver", "Custom route resolver")
                        )),
                        new Menu("Use cases", List.of(
                                new RouteLink("/use-cases/bookings", "Bookings list"),
                                new RouteLink("/use-cases/booking-detail", "Booking detail"),
                                new RouteLink("/use-cases/rra", "Redwood Reference App")
                        ))

                ))
                .build();
    }

    @Override
    public String style() {
        return "width: 100%; height: 100%; display: block;";
    }
}
