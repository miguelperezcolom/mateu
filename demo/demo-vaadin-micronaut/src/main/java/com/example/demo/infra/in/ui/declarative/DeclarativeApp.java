package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.Page;
import io.mateu.uidl.interfaces.MenuSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Submenu;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.function.Function;
import java.util.function.Supplier;

class SampleContent implements Page {
    String name;
    int age;
}

class PagesSubmenu implements Submenu {
    @Menu
    Actionable page1 = new RouteLink("/page1");
    @Menu
    URI page2 = new URI("/page2");
    @Menu
    String page3 = "/page3";

    PagesSubmenu() throws URISyntaxException {
    }
}

@Slf4j
class ContentSubmenu implements Submenu {
    @Menu
    Actionable contentLink = new ContentLink(rq -> new Text("Hola"));
    @Menu
    Mono<?> mono = Mono.just("Hola!");
    @Menu
    Runnable runnable = () -> log.info("Runnable has been called");
    @Menu
    Supplier<?> supplier = () -> new Text("Hola");
    @Menu
    Callable<?> callable = () -> new Text("Hola");
    @Menu
    Function<?,?> function = (rq) -> new Text("Hola");
    @Menu
    SampleContent sampleContent;
}

class MySubmenu implements Submenu {
    @Menu
    Actionable page1 = new RouteLink("/page1");
    @Menu
    Actionable page2 = new RouteLink("/page2");
    @Menu
    MyNestedSubmenu myNestedSUbmenu;
}

class MyNestedSubmenu implements Submenu {
    @Menu
    Actionable page1 = new RouteLink("/page1");
    @Menu
    Actionable page2 = new RouteLink("/page2");
}


@MateuUI("/declarative")
@PageTitle("Antonia")
@HomeRoute("/home")
@Slf4j
public class DeclarativeApp implements App {
    @Menu(selected = true)
    Actionable home = new RouteLink("/home");
    @Menu
    PagesSubmenu pages;
    @Menu
    ContentSubmenu content;
    @Menu
    String allFields = "/all-fields";
    @Menu
    String crud1 = "/crud1";
    @Menu
    MySubmenu mySubmenu;
    @Menu
    MenuSupplier menuSupplier = httpRequest -> List.of(
            new ContentLink("Hola 1", rq -> new Text("Hola 1")),
            new ContentLink("Hola 2",rq -> new Text("Hola 2")),
            new io.mateu.uidl.data.Menu("Page 3", List.of(
                    new ContentLink("/content1", "Content 1", (rq) -> new Text("Hola 1")),
                    new ContentLink("/content2", "Content 2", (rq) -> new Text("Hola 2")),
                    new io.mateu.uidl.data.Menu("Page 4", List.of(
                            new ContentLink("/content3", "Content 3", (rq) -> new Text("Hola 3")),
                            new ContentLink("/content4", "Content 4", (rq) -> new Text("Hola 4"))
                    ))
            ))
    );


    public DeclarativeApp() throws URISyntaxException {
    }
}
