package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.mdd.demoadminpanel.infra.in.ui.changes.Changes;
import io.mateu.mdd.demoadminpanel.infra.in.ui.checkin.CheckInListing;
import io.mateu.mdd.demoadminpanel.infra.in.ui.reservations.Reservations;
import io.mateu.mdd.demoadminpanel.infra.in.ui.wizard.Wizard1;
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
public class Home2 implements WidgetSupplier {

    @Menu
    RouteLink checkin = new RouteLink("/checkin", "Check-in");

    @Menu
    Reservations reservations;

    @Menu
    Wizard1 wizard1;

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
    String xxx;

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

    @Menu
    BannerDemoPage bannerDemo;

    @Menu
    io.mateu.mdd.demoadminpanel.infra.in.ui.partialforms.PartialFormDemo partialForms;


    @NotEmpty
    String name;

    @Button
    public Message greet() {
        return new Message("Hello " + name);
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
