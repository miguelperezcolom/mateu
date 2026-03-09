package com.example.demo.infra.in.ui.pages.persons;

import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.TitleSupplier;

public record PersonEditorView(
        String id,
        String name,
        int age
) implements CrudEditorForm<String>, TitleSupplier {
    @Override
    public void save(HttpRequest httpRequest) {
    }

    @Override
    public String title() {
        return name;
    }
}
