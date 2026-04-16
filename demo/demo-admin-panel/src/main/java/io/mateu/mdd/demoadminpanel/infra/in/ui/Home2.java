package io.mateu.mdd.demoadminpanel.infra.in.ui;

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

@UI("/home2")
@Title("My first Mateu app")
@Style(StyleConstants.CONTAINER)
public class Home2 implements WidgetSupplier {

    @Menu
    Products products;

    @Menu
    NestedApp nestedApp;

    @Menu
    String xxx;

    @Menu
    String page3 = "/page3";

    @Menu
    RouteLink page4 = new RouteLink("/page4", "Page 4");

    @Menu
    RemoteMenu workflow = new RemoteMenu("http://localhost:8105/_workflow");



    @NotEmpty
    String name;

    @Button
    public Message greet() {
        return new Message("Hello " + name);
    }

    @Override
    public List<Component> widgets(HttpRequest httpRequest) {
        return List.of(
                io.mateu.uidl.data.HorizontalLayout.builder().content(List.of(MicroFrontend.builder()
                                .baseUrl("/_forms")
                                .route("/my-tasks")
                                .build(), io.mateu.uidl.data.Text.builder().text("Hola").build()))
                        .style("align-items: flex-end;")
                        .build()
        );
    }
}
