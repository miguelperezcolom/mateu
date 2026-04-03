package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Breadcrumb;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Footer;
import io.mateu.uidl.annotations.OptionsLayout;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.BreadcrumbsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;

import java.util.ArrayList;
import java.util.List;

@Route("/breadcrumbs")
@io.mateu.uidl.annotations.Breadcrumbs({
        @Breadcrumb(label = "Home", url = "/"),
        @Breadcrumb(label = "Users", url = "/users"),
        @Breadcrumb(label = "Detail", url = "/users/123")
})
@Style(StyleConstants.CONTAINER)
public class Breadcrumbs implements BreadcrumbsSupplier {

    @Override
    public List<io.mateu.uidl.data.Breadcrumb> breadcrumbs(HttpRequest httpRequest) {
        return List.of(
                new io.mateu.uidl.data.Breadcrumb("Home", "/"),
                new io.mateu.uidl.data.Breadcrumb("Users", "/users"),
                new io.mateu.uidl.data.Breadcrumb("Miguel", "")
        );
    }

    @Footer
    String footer = "You could also be interested in " +
            "<a href=\"/roles\">Roles</a>, " +
            "<a href=\"/permissions\">Permissions</a> " +
            "or <a href=\"/user-groups\">User Groups</a>";

    @Footer
    String alsoInFooter = "Copyright - Mateu 2026";
}
