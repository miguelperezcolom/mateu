package com.example.demo.infra.in.ui.pages.persons;

import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.TitleSupplier;

public record PersonCreationForm(
        String name,
        int age
) implements CrudCreationForm<String>, TitleSupplier {
    @Override
    public String create(HttpRequest httpRequest) {
        return "1";
    }

    @Override
    public String title() {
        return "New Person";
    }
}
