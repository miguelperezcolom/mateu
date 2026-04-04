package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Breadcrumb;
import io.mateu.uidl.annotations.Footer;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.BreadcrumbsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("")
public class Home {

    @Menu
    String users = "/users";

    @Menu
    GroupsCrud groups;

    @Menu
    String adminUser = "/users/admin?version=2772";

}
