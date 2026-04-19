package com.example.demo.infra.in.ui.fluent;

import io.mateu.uidl.annotations.UI;
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

@UI("/fluent")
public class FluentApp implements AppSupplier {

    @Override
    public App getApp(HttpRequest httpRequest) {
        return App.builder()
                .pageTitle("Fluent Demo App")
                .title("Fluent Demo App")
                .subtitle("This is the subtitle bla, bla, bla")
                .variant(AppVariant.HAMBURGUER_MENU)
                .drawerClosed(true)
                .style("width: 100%;")
                //.cssClasses("redwood")
                .homeRoute("/home")
                .homeBaseUrl("/fluent")
                .menu(List.of(
                        new RouteLink("Home", true),
                        new Menu("/layouts", "Layouts", List.of(
                                new RouteLink("/horizontal", "Horizontal Layout"),
                                new RouteLink("/vertical", "Vertical Layout"),
                                new MenuSeparator(),
                                new RouteLink("/split", "Split Layout"),
                                new RouteLink("/tab", "Tab Layout"),
                                new RouteLink("/form", "Form Layout"),
                                new RouteLink("/accordion", "Accordion Layout"),
                                new RouteLink("/carousel", "Carousel Layout"),
                                new MenuSeparator(),
                                new RouteLink("/board", "Board Layout"),
                                new RouteLink("/master-detail", "Master Detail Layout")
                        )),
                        new Menu("/styling", "Styling", List.of(
                                new RouteLink("/full-width", "Full Width"),
                                new RouteLink("/container", "Container")
                        )),
                        new Menu("/components", "Components", List.of(
                                new Menu("/high-level", "High level", List.of(
                                        new Menu("/forms", "Forms", List.of(
                                                new RouteLink("/basic", "Basic"),
                                                new RouteLink("/counter1", "Counter 1"),
                                                new RouteLink("/counter2", "Counter 2"),
                                                new RouteLink("/counter3", "Counter 3"),
                                                new RouteLink("/counter4", "Counter 4"),
                                                new RouteLink("/counter5", "Counter 5"),
                                                new RouteLink("/counter6", "Counter 6"),
                                                new RouteLink("/with-grid1", "With Grid 1"),
                                                new RouteLink("/with-grid2", "With Grid 2"),
                                                new RouteLink("/string-fields", "String fields"),
                                                new RouteLink("/boolean-fields", "Boolean fields"),
                                                new RouteLink("/numeric-fields", "Numeric fields"),
                                                new RouteLink("/collection-fields", "Collection fields"),
                                                new RouteLink("/grid-fields", "Grid fields"),
                                                new RouteLink("/editable-grid-fields", "Editable grid fields"),
                                                new RouteLink("/data-sourced-fields-1", "Data sourced fields 1"),
                                                new RouteLink("/data-sourced-fields-2", "Data sourced fields 2"),
                                                new RouteLink("/date-fields", "Date fields"),
                                                new RouteLink("/file-fields", "File fields"),
                                                new RouteLink("/other-fields", "Other fields"),
                                                new RouteLink("/choice-fields", "Choice field"),
                                                new RouteLink("/choice-with-images-fields", "Choice with images field"),
                                                new RouteLink("/combobox-default-value", "Combobox default value")
                                        )),
                                        new Menu("/crudls", "Crudls", List.of(
                                                new RouteLink("/basic", "Basic"),
                                                new RouteLink("/more-columns", "More columns"),
                                                new RouteLink("/with-row-menu", "With row menu"),
                                                new RouteLink("/styled", "Styled")
                                        )),
                                        new Menu("/nested-apps", "Nested apps", List.of(
                                                new RouteLink("/left", "Menu On Left"),
                                                new RouteLink("/top", "Menu On Top"),
                                                new RouteLink("/tabs", "Menu Using Tabs")
                                        ))
                                )),
                                new Menu("/building-blocks", "Building blocks", List.of(
                                        new ContentLink("/content0", "Content 0", (rq) -> new Text("Hola 0")),
                                        new RouteLink("/anchor", "Anchor"),
                                        new RouteLink("/avatar", "Avatar"),
                                        new RouteLink("/badge", "Badge"),
                                        new RouteLink("/breadcrumbs", "Breadcrumbs"),
                                        new RouteLink("/button", "Button"),
                                        new RouteLink("/card", "Card"),
                                        new RouteLink("/charts", "Charts"),
                                        new RouteLink("/checkbox", "Checkbox"),
                                        new RouteLink("/choice", "Choice"),
                                        new RouteLink("/combobox", "Combo box"),
                                        new RouteLink("/confirm-dialog", "Confirm Dialog"),
                                        new RouteLink("/context-menu", "Context Menu"),
                                        new RouteLink("/cookie-consent", "Cookie Consent"),
                                        new RouteLink("/custom-field", "Custom Field"),
                                        new RouteLink("/dashboard", "Dashboard"),
                                        new RouteLink("/date-picker", "Date picker"),
                                        new RouteLink("/date-time-picker", "Date Time Picker"),
                                        new RouteLink("/details", "Details"),
                                        new RouteLink("/dialog", "Dialog"),
                                        new RouteLink("/directory", "Directory"),
                                        new RouteLink("/element", "Element"),
                                        new RouteLink("/email-field", "Email Field"),
                                        new RouteLink("/grid", "Grid"),
                                        new RouteLink("/icon", "Icons"),
                                        new RouteLink("/image", "Images"),
                                        new RouteLink("/list-box", "List Box"),
                                        new RouteLink("/map", "Map"),
                                        new RouteLink("/markdown", "Markdown"),
                                        new RouteLink("/menubar", "Menu Bar"),
                                        new RouteLink("/message-input", "Message Input"),
                                        new RouteLink("/message-list", "Message List"),
                                        new RouteLink("/micro-frontend", "Micro frontend"),
                                        new RouteLink("/multi-select-combo-box", "Multi-select Combo Box"),
                                        new RouteLink("/notification", "Notification"),
                                        new RouteLink("/number-field", "Number Field"),
                                        new RouteLink("/password-field", "Password Field"),
                                        new RouteLink("/popover", "Popover"),
                                        new RouteLink("/progress-bar", "Progress bar"),
                                        new RouteLink("/radio-button", "Radio Button"),
                                        new RouteLink("/rich-text-editor", "Rich Text Editor"),
                                        new RouteLink("/scroller", "Scroller"),
                                        new RouteLink("/select", "Select"),
                                        new RouteLink("/side-navigation", "Side Navigation"),
                                        new RouteLink("/text", "Text"),
                                        new RouteLink("/text-area", "Text Area"),
                                        new RouteLink("/text-field", "Text Field"),
                                        new RouteLink("/time-picker", "Time Picker"),
                                        new RouteLink("/tooltip", "Tooltip"),
                                        new RouteLink("/train", "Train"),
                                        new RouteLink("/tree-grid", "Tree Grid"),
                                        new RouteLink("/upload", "Upload"),
                                        new RouteLink("/virtual-list", "Virtual List"),
                                        new RouteLink("/web-component", "Web component")
                                ))
                        )),
                        new Menu("/logic", "Logic", List.of(
                                new Menu("/actions", "Actions", List.of(
                                        new RouteLink("/foreground", "Run in foreground"),
                                        new RouteLink("/background", "Run in background"),
                                        new RouteLink("/confirmation-required", "Confirmation required"),
                                        new RouteLink("/validation-required", "Validation required"),
                                        new RouteLink("/server-side-events", "Server Sent Events (SSE)"),
                                        new RouteLink("/row-selected-required", "Row selected required"),
                                        new RouteLink("/custom-event", "Client side event"),
                                        new RouteLink("/href", "Href"),
                                        new RouteLink("/js", "Js")
                                )),
                                new Menu("/triggers", "Triggers", List.of(
                                        new RouteLink("/on-load", "On Load"),
                                        new RouteLink("/on-success", "On Success"),
                                        new RouteLink("/on-error", "On Error"),
                                        new RouteLink("/on-custom-event", "On Custom Event"),
                                        new RouteLink("/on-value-change", "On Value Change")
                                )),
                                new Menu("/rules", "Client-Side Logic (Rules)", List.of(
                                        new RouteLink("/visibility-from-backend", "Visibility from backend"),
                                        new RouteLink("/enabled-from-backend", "Enabled from backend"),
                                        new RouteLink("/visibility", "Visibility"),
                                        new RouteLink("/enabled", "Enabled"),
                                        new RouteLink("/run-action", "Run Action"),
                                        new RouteLink("/run-js", "Run JS"),
                                        new RouteLink("/set-attribute-value", "Set attribute value"),
                                        new RouteLink("/set-metadata-value", "Set metadata value"),
                                        new RouteLink("/set-data-value", "Set data value"),
                                        new RouteLink("/set-css-classes", "Set css classes"),
                                        new RouteLink("/set-style", "Set style")
                                )),
                                new Menu("/validations", "Validations", List.of(
                                        new RouteLink("/required", "Required"),
                                        new RouteLink("/min-and-max", "Min and Max"),
                                        new RouteLink("/min-and-max-length", "Min and Max length"),
                                        new RouteLink("/pattern", "Pattern"),
                                        new RouteLink("/conditional", "Conditional"),
                                        new RouteLink("/form-wise", "Form wise"),
                                        new RouteLink("/server-side", "Server side")
                                )),
                                new Menu("/commands-and-messages", "Commands and messages", List.of(
                                        new RouteLink("/run-action", "Run action"),
                                        new RouteLink("/close-dialog", "Close dialog"),
                                        new RouteLink("/set-favicon", "Set favicon"),
                                        new RouteLink("/set-window-title", "Set window title"),
                                        new RouteLink("/message", "Message")
                                ))
                        )),
                        new Menu("/patterns", "Patterns", List.of(
                                new RouteLink("/async", "Async"),
                                new RouteLink("/master-detail", "Master-detail"),
                                new RouteLink("/progressive", "Progressive UI"),
                                new RouteLink("/micro-frontend", "Micro frontends")
                        )),
                        new Menu("/data", "Data", List.of(
                                new RouteLink("/app-state", "App state"),
                                new RouteLink("/app-data", "App data"),
                                new RouteLink("/component-state", "Component state"),
                                new RouteLink("/component-data", "Component data"),
                                new RouteLink("/component-state-and-data", "Component state and data")
                        )),
                        new Menu("/routes", "Routes", List.of(
                                new RouteLink("/404", "404"),
                                new RouteLink("custom-route-resolver", "Custom route resolver")
                        )),
                        new Menu("/use-cases", "Use cases", List.of(
                                new RouteLink("/bookings", "Bookings list"),
                                new RouteLink("/booking-detail", "Booking detail"),
                                new RouteLink("/rra", "Redwood Reference App")
                        ))

                ))
                .build();
    }

    @Override
    public String style() {
        return "width: 100%; height: 100%; display: block;";
    }
}
