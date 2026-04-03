package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.uidl.annotations.Breadcrumb;
import io.mateu.uidl.annotations.Breadcrumbs;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.OptionsLayout;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.BreadcrumbsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;

import java.util.ArrayList;
import java.util.List;

@Route("/manycheckboxes")
@Breadcrumbs({
        @Breadcrumb(label = "Home", url = "/"),
        @Breadcrumb(label = "Users", url = "/users"),
        @Breadcrumb(label = "Detail", url = "/users/123")
})
public class ManyCheckboxes implements OptionsSupplier, BreadcrumbsSupplier {

    @Stereotype(FieldStereotype.checkbox)
    @OptionsLayout(columns = 3)
    List<String> options = List.of("value_2", "value_3", "value_7");


    @Button
    Object save() {
        return new Message("Saved " + options);
    }

    @Override
    public List<Option> options(String fieldName, HttpRequest httpRequest) {
        if ("options".equals(fieldName)) {
            List<Option> validOptions = new ArrayList<>();
            for (int i = 0; i < 30; i++) {
                validOptions.add(new Option("value_" + i, "Option " + i));
            }
            return validOptions;
        }
        return List.of();
    }

    @Override
    public List<io.mateu.uidl.data.Breadcrumb> breadcrumbs(HttpRequest httpRequest) {
        return List.of(
                new io.mateu.uidl.data.Breadcrumb("Home", "/"),
                new io.mateu.uidl.data.Breadcrumb("Users", "/users"),
                new io.mateu.uidl.data.Breadcrumb("Miguel", "")
        );
    }
}
