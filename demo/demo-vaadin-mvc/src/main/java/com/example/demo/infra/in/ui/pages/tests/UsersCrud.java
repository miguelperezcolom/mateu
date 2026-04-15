package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.uidl.RouteConstants;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.Page;

@Route(value = "/users/:id", parentRoute = RouteConstants.NO_PARENT_ROUTE)
@Route(value = "/users2/:id", parentRoute = RouteConstants.NO_PARENT_ROUTE)
@Route(value = "/users3", parentRoute = RouteConstants.NO_PARENT_ROUTE)
public class UsersCrud implements Page {

    String id = "xxx";

    int version = 111112;

    String msg = "Hola";

}
