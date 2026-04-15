package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Route;

@Route(value = "/xxx", parentRoute = "/home2")
public class NestedApp {

    @Menu
    Page1 page1;

    @Menu
    Page2 page2;

}
