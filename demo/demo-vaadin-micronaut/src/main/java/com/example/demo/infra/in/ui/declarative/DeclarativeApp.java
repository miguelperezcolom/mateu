package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HasMenu;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Submenu;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.function.Function;
import java.util.function.Supplier;

class SampleContent implements Form {
    String name;
    int age;
}

class MySubmenu implements Submenu {
    @Menu
    Actionable page1 = new RouteLink("/app/page1");
    @Menu
    Actionable page2 = new RouteLink("/app/page2");
    @Menu
    MyNestedSubmenu myNestedSUbmenu;
}

class MyNestedSubmenu implements Submenu {
    @Menu
    Actionable page1 = new RouteLink("/app/page1");
    @Menu
    Actionable page2 = new RouteLink("/app/page2");
}


@Route("/app")
@PageTitle("Antonia")
@HomeRoute("/app/home")
public class DeclarativeApp implements App {

    @Menu(selected = true)
    Actionable home = new RouteLink("/app/home");
    @Menu
    Actionable page1 = new RouteLink("/app/page1");
    @Menu
    Actionable page2 = new RouteLink("/app/page2");
    @Menu
    Actionable content = new ContentLink(rq -> new Text("Hola"));
    @Menu
    Supplier<?> page4 = () -> new Text("Hola");
    @Menu
    Callable<?> page5 = () -> new Text("Hola");
    @Menu
    Function<?,?> page6 = (rq) -> new Text("Hola");
    @Menu
    SampleContent page7;
    @Menu
    MySubmenu page8;
    @Menu
    HasMenu page9 = new HasMenu() {
        @Override
        public List<Actionable> createMenu(HttpRequest httpRequest) {
            return List.of(
                    new ContentLink(rq -> new Text("Hola 1")),
                    new ContentLink(rq -> new Text("Hola 2")),
                    new io.mateu.uidl.data.Menu("Page 3", List.of(
                            new ContentLink("/app/content1", "Content 1", (rq) -> new Text("Hola 1")),
                            new ContentLink("/app/content2", "Content 2", (rq) -> new Text("Hola 2")),
                            new io.mateu.uidl.data.Menu("Page 4", List.of(
                                    new ContentLink("/app/content3", "Content 3", (rq) -> new Text("Hola 3")),
                                    new ContentLink("/app/content4", "Content 4", (rq) -> new Text("Hola 4"))
                            ))
                    ))
            );
        }
    };


}
