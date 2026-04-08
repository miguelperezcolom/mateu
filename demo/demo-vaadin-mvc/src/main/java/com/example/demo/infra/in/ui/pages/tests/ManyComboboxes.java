package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Breadcrumb;
import io.mateu.uidl.annotations.Breadcrumbs;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.*;

import java.util.ArrayList;
import java.util.List;

@Route("/manycomboboxes")
@Breadcrumbs({
        @Breadcrumb(label = "Home", url = "/"),
        @Breadcrumb(label = "Users", url = "/users"),
        @Breadcrumb(label = "Detail", url = "/users/123")
})
public class ManyComboboxes implements OptionsSupplier, BreadcrumbsSupplier, LookupOptionsSupplier, LabelSupplier {

    //@OptionsLayout(columns = 3)
    @Stereotype(FieldStereotype.combobox)
    List<String> options = List.of("value_2", "value_3", "value_7");

    @Stereotype(FieldStereotype.combobox)
            @Lookup
    List<String> lookupOptions = List.of("value_2", "value_3", "value_7");


    @Button
    Object save() {
        return new Message("Saved " + options);
    }

    @Override
    public List<Option> options(String fieldName, HttpRequest httpRequest) {
        if ("options".equals(fieldName)) {
            return validOptions();
        }
        return null;
    }

    @Override
    public List<io.mateu.uidl.data.Breadcrumb> breadcrumbs(HttpRequest httpRequest) {
        return List.of(
                new io.mateu.uidl.data.Breadcrumb("Home", "/"),
                new io.mateu.uidl.data.Breadcrumb("Users", "/users"),
                new io.mateu.uidl.data.Breadcrumb("Miguel", "")
        );
    }

    @Override
    public ListingData<Option> search(String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(validOptions().stream()
                .filter(option -> option.label().toLowerCase().contains(searchText.toLowerCase()))
                .toList());
    }

    private List<Option> validOptions() {
        List<Option> validOptions = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            validOptions.add(new Option("value_" + i, "Option " + i));
        }
        return validOptions;
    }

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
        return validOptions().stream()
                .filter(option -> option.value().equals(id))
                .findFirst()
                        .map(Option::label)
                .orElse("Not found");
    }
}
