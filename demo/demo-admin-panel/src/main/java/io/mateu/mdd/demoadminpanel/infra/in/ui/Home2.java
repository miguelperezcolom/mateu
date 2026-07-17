package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.mdd.demoadminpanel.infra.in.ui.changes.Changes;
import io.mateu.mdd.demoadminpanel.infra.in.ui.checkin.CheckInListing;
import io.mateu.mdd.demoadminpanel.infra.in.ui.reservations.Reservations;
import io.mateu.mdd.demoadminpanel.infra.in.ui.wizard.Wizard1;
import io.mateu.mdd.demoadminpanel.infra.in.ui.wizard.WizardAccordion;
import io.mateu.mdd.demoadminpanel.infra.in.ui.wizard.WizardAccumulative;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.WidgetSupplier;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@UI("")
@Title("My first Mateu app")
@AI(sse = "http://localhost:8095/ai/api/agent/stream")
@App(themeToggle = true)
public class Home2 implements WidgetSupplier, io.mateu.uidl.interfaces.AppActionsSupplier {

    @Menu
    RouteLink checkin = new RouteLink("/checkin", "Check-in");

    @Menu
    Reservations reservations;

    @Menu
    Wizard1 wizard1;

    @Menu
    WizardAccumulative wizardAccumulative;

    @Menu
    WizardAccordion wizardAccordion;

    @Menu
    Products2 xxxx;

    @Menu
    Products products;

    @Menu
    Products frfr;

    @Menu
    WorkflowMenu workflow;

    @Menu
    Changes changes;

    @Menu
    NestedApp nestedApp;

    @Menu
    String page3 = "/page3";

    @Menu
    RouteLink page4 = new RouteLink("/page4", "Page 4");

//    @Menu
//    RemoteMenu workflow = new RemoteMenu("http://localhost:8105/_workflow");


    @Menu
    Page5 page5;

    @Menu
    HotelSelector hotelSelector;

    // application-level context: the active hotel, shown as a selector on the app header; every
    // screen can read it via httpRequest.appContext("hotel")
    @io.mateu.uidl.annotations.AppContext(label = "Hotel")
    HotelSelector hotel;

    enum Environment { DEV, STAGING, PRODUCTION }

    // enum-backed context: its constants are the options (renders as a compact select)
    @io.mateu.uidl.annotations.AppContext(label = "Env")
    Environment environment;

    enum Modo { Staff, Cliente }

    // persona projection: naming this @AppContext field "audience" makes its value drive the
    // @Audience marks — unset → full view; Staff/Cliente → that audience's projection (/audience-demo)
    @io.mateu.uidl.annotations.AppContext(label = "Modo")
    Modo audience;

    @Menu
    io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice.AudienceDemo audienceDemo;

    @Menu
    BannerDemoPage bannerDemo;

    @Menu
    io.mateu.mdd.demoadminpanel.infra.in.ui.tree.TreeSelectDemo treeSelect;

    @Menu
    io.mateu.mdd.demoadminpanel.infra.in.ui.typedfilters.BookingsListing typedFilters;

    @Menu
    io.mateu.mdd.demoadminpanel.infra.in.ui.partialforms.PartialFormDemo partialForms;

    @Menu
    io.mateu.mdd.demoadminpanel.infra.in.ui.aggregates.SalesReport salesReport;


    // app header actions: buttons next to the @AppContext pickers; the dropdown's CHILDREN dispatch
    @Override
    public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
        return List.of(
                new AppHeaderAction("syncNow", "Sync", "vaadin:refresh"),
                AppHeaderAction.menu("Export", "vaadin:download", List.of(
                        new AppHeaderAction("exportPdf", "As PDF"),
                        new AppHeaderAction("exportExcel", "As Excel"))));
    }

    public Message syncNow() {
        return new Message("Synced");
    }

    public Message exportPdf() {
        return new Message("Exported as PDF");
    }

    public Message exportExcel() {
        return new Message("Exported as Excel");
    }

    @NotEmpty
    String name;

    @Button
    public Message greet(HttpRequest httpRequest) {
        var hotel = httpRequest.appContext("hotel");
        return new Message("Hello " + name + (hotel != null ? " (hotel " + hotel + ")" : " (no hotel selected)"));
    }

    @Override
    public List<Component> widgets(HttpRequest httpRequest) {
        return List.of(
//                io.mateu.uidl.data.HorizontalLayout.builder().content(List.of(MicroFrontend.builder()
//                                .baseUrl("/_forms")
//                                .route("/my-tasks")
//                                .build(), io.mateu.uidl.data.Text.builder().text("Hola").build()))
//                        .style("align-items: flex-end;")
//                        .build()
        );
    }
}
