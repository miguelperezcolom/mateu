package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.ContextMenu;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/context-menu")
public class ContextMenuComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Context menu")
                .content(List.of(

                        new Text("basic", TextContainer.h6),

                        ContextMenu.builder()
                                .menu(List.of(
                                        RouteLink.builder()
                                                .label("Page 1")
                                                .build(),
                                        RouteLink.builder()
                                                .label("Page 2")
                                                .build()
                                ))
                                .wrapped(new Text("I am a wrapped element. Just right click me :)"))
                                .build(),

                        new Text("left click", TextContainer.h6),

                        ContextMenu.builder()
                                .menu(List.of(
                                        RouteLink.builder()
                                                .label("Page 1")
                                                .build(),
                                        RouteLink.builder()
                                                .label("Page 2")
                                                .itemData("hola!")
                                                .disabledOnClick(true)
                                                .build()
                                ))
                                .wrapped(new Text("I am a wrapped element. Just LEFT click me :)"))
                                .activateOnLeftClick(true)
                                .build(),

                        new Text("with submenu", TextContainer.h6),

                        ContextMenu.builder()
                                .menu(List.of(
                                        RouteLink.builder()
                                                .route("/fluent-app/nested-apps/left/home")
                                                .label("Home")
                                                .className("red")
                                                .selected(true)
                                                .build(),
                                        MenuSeparator.builder().build(),
                                        RouteLink.builder()
                                                .route("/fluent-app/nested-apps/left/page1")
                                                .label("Page 1")
                                                .component(Badge.builder()
                                                        .text("Hola hola")
                                                        .build())
                                                .build(),
                                        new Menu("Submenu", List.of(
                                                RouteLink.builder()
                                                        .route("/fluent-app/nested-apps/left/home")
                                                        .label("Home again")
                                                        .selected(true)
                                                        .disabledOnClick(true)
                                                        .build(),
                                                RouteLink.builder()
                                                        .route("/fluent-app/nested-apps/left/page1")
                                                        .label("Page 1 again")
                                                        .disabled(true)
                                                        .build()
                                        ))
                                ))
                                .wrapped(new Text("I am a wrapped element. Just right click me :)"))
                                .build(),


                        new Text("")

                ))
                .build();
    }
}
